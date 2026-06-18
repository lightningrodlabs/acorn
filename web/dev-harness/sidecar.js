/*
 * Dev harness sidecar — the host that owns the ACP connection so the renderer
 * doesn't have to (the renderer is a browser context and can't spawn the agent
 * subprocess ACP requires). Attached to the webpack-dev-server's HTTP server, it
 * exposes a WebSocket at /__acorn_harness and bridges:
 *
 *     renderer  <--WS frames-->  sidecar  <--ACP JSON-RPC/stdio-->  agent
 *
 * The agent (ACORN_HARNESS_CMD) is spawned once and kept alive at MODULE scope —
 * it is a child of the long-lived dev server, so it (and its ACP sessions)
 * SURVIVE a renderer reload. On reconnect the renderer reattaches to its session
 * by id (resumeSession) instead of losing context. Frames pushed to the renderer
 * (updates / permission requests) go through the "current binding" (the live WS)
 * and are queued while no renderer is attached, then flushed on reattach.
 *
 * It is plain Node CommonJS (never bundled into the renderer); the WS frame
 * shapes mirror web/src/harness/protocol.ts.
 *
 * Pure config: with no ACORN_HARNESS_CMD set, it tells the renderer the harness
 * is unavailable (so the chat UI hides). The harness:claude / harness:gemini /
 * harness:openrouter dev scripts set that env.
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { Readable, Writable } = require('node:stream')
const { WebSocketServer } = require('ws')
const { loadMcpServers, toAcpServers } = require('./mcpConfig')
const { skillPromptBlocks } = require('./skill')

const HARNESS_PATH = '/__acorn_harness'

// How long the sidecar waits for the renderer to run a hosted tool (read_tree /
// propose_edits) before failing the call back to the agent.
const TOOL_TIMEOUT_MS = 120000

// The ACORN-HOSTED MCP server, attached to every agent session so the agent can
// call read_tree / propose_edits (clarity-tree draft pipeline L1 + the read leaf).
// It is a stdio child that bridges tools/call back to THIS sidecar over HTTP
// (/__acorn_tool), which relays to the renderer where the store lives. Spawned
// with the same node binary; the dev-server port is handed in so it can reach us.
function acornToolsServerEntry() {
  return {
    name: 'acorn',
    type: 'stdio',
    command: process.execPath,
    args: [path.join(__dirname, 'acornToolsServer.js')],
    env: [{ name: 'ACORN_WEB_PORT', value: String(process.env.WEB_PORT || '') }],
  }
}

// The ACP SDK is ESM-only; load it once via dynamic import from this CJS module.
let acpPromise = null
const loadAcp = () => {
  if (!acpPromise) acpPromise = import('@agentclientprotocol/sdk')
  return acpPromise
}

const configuredCmd = () => {
  const c = process.env.ACORN_HARNESS_CMD
  return c && c.trim() ? c : null
}

// System-prompt control. claude-agent-acp defaults to the `claude_code` preset
// (the "You are Claude Code…" identity + tool-use/tone sections + dynamic
// working-dir/memory/git context). We override it per-session via ACP
// `_meta.systemPrompt`, which the agent maps onto the Claude Agent SDK:
//   - a STRING fully REPLACES the preset (no Claude identity, no tool-use prose)
//   - an OBJECT is locked to {type:preset, preset:claude_code} but forwards
//     `append` / `excludeDynamicSections`, i.e. augments rather than replaces.
// Config (checked in order; unset = leave the default preset untouched):
//   ACORN_SYSTEM_PROMPT_FILE  path whose contents become the full prompt
//   ACORN_SYSTEM_PROMPT       inline full-replacement prompt
//   ACORN_SYSTEM_PROMPT_APPEND  extra text appended to the claude_code preset
function resolveSystemPrompt() {
  const file = process.env.ACORN_SYSTEM_PROMPT_FILE
  if (file && file.trim()) return withModelNote(fs.readFileSync(file.trim(), 'utf8'))
  const inline = process.env.ACORN_SYSTEM_PROMPT
  if (inline && inline.trim()) return withModelNote(inline)
  // NOTE: appending to the claude_code preset can ADD facts but does NOT reliably
  // override the preset's authoritative "You are Claude Code" opening — the model
  // keeps claiming to be Claude Code. Use a full-replacement prompt (the FILE /
  // inline paths above) when the identity must actually change.
  const append = process.env.ACORN_SYSTEM_PROMPT_APPEND
  if (append && append.trim())
    return { type: 'preset', preset: 'claude_code', append: withModelNote(append) }
  return null
}

// The model backing this session, for the identity line. Picked up from the
// harness call: ANTHROPIC_MODEL (set by harness:openrouter et al.), overridable
// with ACORN_MODEL_LABEL for a friendlier name or for backends (e.g. OpenCode)
// that configure the model outside the environment. null = unknown, so we omit
// the claim rather than assert a wrong one.
function harnessModelLabel() {
  const v = process.env.ACORN_MODEL_LABEL || process.env.ANTHROPIC_MODEL
  return v && v.trim() ? v.trim() : null
}

// Fold a "backed by <model>" sentence into the appended identity text, so the
// assistant can state what powers it. Returns the text unchanged when the model
// is unknown.
function withModelNote(append) {
  const model = harnessModelLabel()
  if (!model) return append
  return `${append}\n\nYou are backed by the model \`${model}\`; if asked what powers you, you may say so.`
}

// ACP ContentBlock (agent->client text extraction) -> plain string.
const blockToText = (block) => {
  if (!block) return ''
  if (block.type === 'text') return block.text || ''
  if (block.type === 'resource' && block.resource) return block.resource.text || ''
  return ''
}

// renderer HarnessContentBlock -> ACP ContentBlock
const toAcpBlock = (b) => {
  if (b.type === 'resource')
    return {
      type: 'resource',
      resource: { uri: b.uri, mimeType: b.mimeType || 'text/plain', text: b.text },
    }
  return { type: 'text', text: b.text }
}

// ACP session/update -> renderer HarnessUpdate (null = ignore)
const toHarnessUpdate = (u) => {
  switch (u.sessionUpdate) {
    case 'agent_message_chunk':
      return { type: 'message', text: blockToText(u.content) }
    case 'agent_thought_chunk':
      return { type: 'thought', text: blockToText(u.content) }
    case 'tool_call':
    case 'tool_call_update':
      return {
        type: 'tool_call',
        toolCallId: u.toolCallId,
        title: u.title || '',
        status: u.status || 'pending',
        kind: u.kind,
      }
    case 'plan':
      return {
        type: 'plan',
        entries: (u.entries || []).map((e) => ({
          content: e.content,
          priority: e.priority,
          status: e.status,
        })),
      }
    case 'current_mode_update':
      return { type: 'mode', modeId: u.currentModeId || u.modeId }
    default:
      return null
  }
}

const wsSend = (ws, frame) => {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(frame))
}

// ---------------------------------------------------------------------------
// The persistent agent. One ACP connection for the lifetime of the dev server,
// reattached to whichever renderer WS is currently connected.
// ---------------------------------------------------------------------------
let agent = null // the singleton state, or null until first spawned / after exit

// Push a frame to the attached renderer; queue it if none is attached right now
// (e.g. mid-reload) so it can be flushed when the renderer reattaches.
function pushToBinding(state, frame) {
  if (state.binding && state.binding.readyState === state.binding.OPEN)
    state.binding.send(JSON.stringify(frame))
  else state.pendingFrames.push(frame)
}

function bindAndFlush(state, ws) {
  state.binding = ws
  if (state.pendingFrames.length) {
    const queued = state.pendingFrames
    state.pendingFrames = []
    for (const f of queued) wsSend(ws, f)
  }
}

// The ACP Client handler the agent calls back into. Routes to the current
// binding (and queues while detached) rather than any one WS, so callbacks keep
// working across reloads.
function makeClient(state) {
  return {
    sessionUpdate: async (params) => {
      // During loadSession the agent replays the whole history as updates; we
      // restore the transcript from the renderer's own store instead, so drop them.
      if (state.replaying) return
      const update = toHarnessUpdate(params.update)
      if (update)
        pushToBinding(state, { t: 'update', sessionId: params.sessionId, update })
    },
    requestPermission: async (params) => {
      const requestId = state.nextPermissionId++
      const tc = params.toolCall || {}
      pushToBinding(state, {
        t: 'permissionRequest',
        requestId,
        sessionId: params.sessionId,
        request: {
          toolCall: { toolCallId: tc.toolCallId, title: tc.title || '', kind: tc.kind },
          options: params.options || [],
        },
      })
      const decision = await new Promise((resolve) =>
        state.pendingPermissions.set(requestId, resolve)
      )
      return { outcome: decision }
    },
    readTextFile: async (params) => ({ content: fs.readFileSync(params.path, 'utf8') }),
    writeTextFile: async (params) => {
      fs.writeFileSync(params.path, params.content)
      return null
    },
  }
}

async function getAgent() {
  if (agent) return agent
  const cmd = configuredCmd()
  if (!cmd)
    throw new Error(
      'No LLM harness configured. Set ACORN_HARNESS_CMD (or run yarn harness:claude / harness:gemini / harness:openrouter).'
    )
  const acp = await loadAcp()
  // shell:true so ACORN_HARNESS_CMD can be a full command line with args.
  const child = spawn(cmd, { shell: true, stdio: ['pipe', 'pipe', 'inherit'] })
  const state = {
    acp,
    child,
    agent: null, // ClientSideConnection (the ACP Agent role)
    binding: null, // the currently attached renderer WS
    pendingFrames: [], // frames buffered while no renderer is attached
    sessions: new Set(), // session ids this agent currently holds
    initialized: false,
    info: null,
    canLoadSession: false, // agent advertises ACP session/load (the --resume analog)
    replaying: false, // true while loadSession streams history we DON'T re-show
    // MCP servers attached to this agent's sessions. The config list is read once
    // (agent-agnostic); acpMcpServers is the wire shape, resolved at initialize
    // once the agent's http/sse mcpCapabilities are known (native vs mcp-remote).
    // the hosted Acorn tools server FIRST, then any user-configured servers
    mcpServers: [acornToolsServerEntry(), ...loadMcpServers()],
    acpMcpServers: [],

    // sessions that have already been seeded with the clarity-trees skill (we
    // inject it once on a session's first prompt, not every turn).
    skillSentSessions: new Set(),

    nextPermissionId: 1,
    pendingPermissions: new Map(),
    activePromptIds: new Set(),
    // hosted tool calls (read_tree / propose_edits) awaiting a renderer reply
    nextToolId: 1,
    pendingToolCalls: new Map(),
  }
  child.on('error', (e) =>
    pushToBinding(state, { t: 'unavailable', reason: `failed to spawn agent: ${e.message}` })
  )
  child.on('exit', (code, signal) => {
    // No turnEnd will arrive for an in-flight turn — fail it (ACP has no
    // heartbeat; process death is the host's signal). Drop the singleton so the
    // next request respawns.
    const reason = `agent process exited${
      code != null ? ` (code ${code})` : signal ? ` (${signal})` : ''
    }`
    for (const id of state.activePromptIds)
      pushToBinding(state, { t: 'error', id, message: reason })
    if (agent === state) agent = null
  })
  const input = Readable.toWeb(child.stdout)
  const output = Writable.toWeb(child.stdin)
  state.agent = new acp.ClientSideConnection(
    () => makeClient(state),
    acp.ndJsonStream(output, input)
  )
  agent = state
  return state
}

// Handle one frame from a renderer WS. Correlated replies go straight back to
// the requesting ws; streamed updates/permissions go through the binding.
async function handleFrame(ws, frame) {
  try {
    const state = await getAgent()
    bindAndFlush(state, ws)
    switch (frame.t) {
      case 'initialize': {
        if (!state.initialized) {
          const res = await state.agent.initialize({
            protocolVersion: state.acp.PROTOCOL_VERSION,
            clientCapabilities: {
              fs: { readTextFile: true, writeTextFile: true },
              terminal: false,
            },
          })
          state.initialized = true
          state.canLoadSession = !!(
            res.agentCapabilities && res.agentCapabilities.loadSession
          )
          // Resolve MCP servers now that we know the agent's http/sse support:
          // natively-forwarded servers vs ones bridged through stdio mcp-remote.
          const mcpCaps =
            (res.agentCapabilities && res.agentCapabilities.mcpCapabilities) || {}
          state.acpMcpServers = toAcpServers(state.mcpServers, mcpCaps)
          if (state.mcpServers.length)
            // eslint-disable-next-line no-console
            console.log(
              `[acorn-harness] MCP servers attached: ${state.mcpServers
                .map((s) => s.name)
                .join(', ')}`
            )
          state.info = {
            protocolVersion: res.protocolVersion,
            agentName: res.agentInfo && res.agentInfo.name,
            canLoadSession: state.canLoadSession,
            mcpServers: state.mcpServers.map((s) => s.name),
          }
        }
        wsSend(ws, { t: 'initialized', id: frame.id, info: state.info })
        return
      }
      case 'newSession': {
        const systemPrompt = resolveSystemPrompt()
        const res = await state.agent.newSession({
          cwd: frame.cwd || process.cwd(),
          mcpServers: state.acpMcpServers,
          ...(systemPrompt != null ? { _meta: { systemPrompt } } : {}),
        })
        state.sessions.add(res.sessionId)
        wsSend(ws, { t: 'sessionCreated', id: frame.id, sessionId: res.sessionId })
        return
      }
      case 'resumeSession': {
        // Fast path: the agent outlived the renderer reload, so the session is
        // still in memory — reattaching the WS is the whole resume.
        if (state.sessions.has(frame.sessionId)) {
          wsSend(ws, { t: 'sessionResumed', id: frame.id, sessionId: frame.sessionId })
          return
        }
        // Durable path (the --resume analog): a fresh agent reloads the session
        // from its own on-disk history via ACP session/load. Replay is suppressed
        // (the renderer restores the visible transcript from its store).
        if (state.canLoadSession && state.agent.loadSession) {
          state.replaying = true
          try {
            await state.agent.loadSession({
              sessionId: frame.sessionId,
              cwd: frame.cwd || process.cwd(),
              mcpServers: state.acpMcpServers,
            })
            state.sessions.add(frame.sessionId)
            wsSend(ws, { t: 'sessionResumed', id: frame.id, sessionId: frame.sessionId })
          } catch (_) {
            wsSend(ws, { t: 'sessionResumeFailed', id: frame.id })
          } finally {
            state.replaying = false
          }
          return
        }
        wsSend(ws, { t: 'sessionResumeFailed', id: frame.id })
        return
      }
      case 'prompt': {
        const blocks = (frame.blocks || []).map(toAcpBlock)
        // Seed the clarity-trees skill once per session, ahead of the turn's
        // own blocks, so it grounds every tree-editing request in the session.
        if (!state.skillSentSessions.has(frame.sessionId)) {
          state.skillSentSessions.add(frame.sessionId)
          blocks.unshift(...skillPromptBlocks())
        }
        state.activePromptIds.add(frame.id)
        try {
          const res = await state.agent.prompt({
            sessionId: frame.sessionId,
            prompt: blocks,
          })
          pushToBinding(state, {
            t: 'turnEnd',
            id: frame.id,
            stopReason: res.stopReason,
          })
        } finally {
          state.activePromptIds.delete(frame.id)
        }
        return
      }
      case 'cancel': {
        if (state.agent) state.agent.cancel({ sessionId: frame.sessionId })
        return
      }
      case 'permissionDecision': {
        const resolve = state.pendingPermissions.get(frame.requestId)
        if (resolve) {
          state.pendingPermissions.delete(frame.requestId)
          resolve(frame.decision)
        }
        return
      }
      case 'toolResult': {
        const resolve = state.pendingToolCalls.get(frame.requestId)
        if (resolve) {
          state.pendingToolCalls.delete(frame.requestId)
          resolve(frame.result)
        }
        return
      }
    }
  } catch (e) {
    const message = String((e && e.message) || e)
    if (frame && frame.id != null) wsSend(ws, { t: 'error', id: frame.id, message })
    else wsSend(ws, { t: 'unavailable', reason: message })
  }
}

/**
 * Relay a hosted tool call to the attached renderer and await its result. Called
 * by the /__acorn_tool HTTP bridge, which the hosted MCP server POSTs to. Returns
 * a HarnessToolResult ({ ok, result } | { ok:false, error }). Fails fast (rather
 * than hanging the agent) when no renderer is attached.
 */
function callRendererTool(tool, args) {
  return new Promise((resolve) => {
    const state = agent
    if (
      !state ||
      !state.binding ||
      state.binding.readyState !== state.binding.OPEN
    ) {
      resolve({
        ok: false,
        error: 'Acorn is not connected — open the app and the chat panel first.',
      })
      return
    }
    const requestId = state.nextToolId++
    const timer = setTimeout(() => {
      if (state.pendingToolCalls.has(requestId)) {
        state.pendingToolCalls.delete(requestId)
        resolve({ ok: false, error: 'Acorn tool call timed out.' })
      }
    }, TOOL_TIMEOUT_MS)
    state.pendingToolCalls.set(requestId, (result) => {
      clearTimeout(timer)
      resolve(result)
    })
    pushToBinding(state, { t: 'toolCall', requestId, call: { tool, args } })
  })
}

/**
 * An http middleware (req,res,next) bridging the hosted MCP server's POSTs to
 * callRendererTool. Mirrors the /__acorn_diff bridge; wired in webpack.dev.js.
 */
function toolBridgeMiddleware(req, res, next) {
  if (!req.url || !req.url.startsWith('/__acorn_tool')) return next()
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end('method not allowed')
  }
  let body = ''
  req.setEncoding('utf8')
  req.on('data', (c) => (body += c))
  req.on('end', async () => {
    let parsed
    try {
      parsed = JSON.parse(body || '{}')
    } catch (e) {
      res.statusCode = 400
      res.setHeader('content-type', 'application/json')
      return res.end(JSON.stringify({ ok: false, error: 'invalid JSON' }))
    }
    const result = await callRendererTool(parsed.tool, parsed.args)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(result))
  })
}

let cleanupHooked = false
function hookProcessCleanup() {
  if (cleanupHooked) return
  cleanupHooked = true
  const killChild = () => {
    if (agent && agent.child) {
      try {
        agent.child.kill()
      } catch (_) {}
    }
  }
  process.on('exit', killChild)
  process.on('SIGINT', () => {
    killChild()
    process.exit()
  })
  process.on('SIGTERM', () => {
    killChild()
    process.exit()
  })
}

/**
 * Attach the harness WS server to the dev-server's HTTP server.
 * Idempotent per server (guards against repeated setupMiddlewares calls).
 */
function attachHarnessSidecar(server) {
  if (!server || server.__acornHarnessAttached) return
  server.__acornHarnessAttached = true
  hookProcessCleanup()
  // Share the http server with webpack-dev-server's HMR socket. We MUST use
  // noServer + a path-guarded upgrade handler that RETURNS on mismatch: a
  // {server,path}-bound ws server aborts (destroys) non-matching upgrades, which
  // would kill HMR. This mirrors how wds attaches its own socket.
  const wss = new WebSocketServer({ noServer: true })
  server.on('upgrade', (req, socket, head) => {
    let pathname
    try {
      pathname = new URL(req.url, 'http://localhost').pathname
    } catch (_) {
      return
    }
    if (pathname !== HARNESS_PATH) return // leave HMR + other upgrades untouched
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
  })
  wss.on('connection', (ws) => {
    if (!configuredCmd()) {
      wsSend(ws, {
        t: 'unavailable',
        reason: 'No LLM harness configured (ACORN_HARNESS_CMD unset).',
      })
    }
    ws.on('message', (data) => {
      let frame
      try {
        frame = JSON.parse(data.toString())
      } catch (_) {
        return
      }
      handleFrame(ws, frame)
    })
    // Renderer reload / disconnect: just detach — DON'T kill the agent, so the
    // session survives for resumeSession. Resolve any pending permission so the
    // agent isn't wedged waiting on a UI that's gone.
    ws.on('close', () => {
      if (agent && agent.binding === ws) agent.binding = null
    })
  })
  // eslint-disable-next-line no-console
  console.log(
    `[acorn-harness] WebSocket on ${HARNESS_PATH}` +
      (configuredCmd()
        ? ` (agent: ${configuredCmd()})`
        : ' (no ACORN_HARNESS_CMD — harness unavailable)')
  )
}

module.exports = {
  attachHarnessSidecar,
  HARNESS_PATH,
  callRendererTool,
  toolBridgeMiddleware,
}
