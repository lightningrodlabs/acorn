/*
 * Dev harness sidecar — the host that owns the ACP connection so the renderer
 * doesn't have to (the renderer is a browser context and can't spawn the agent
 * subprocess ACP requires). Attached to the webpack-dev-server's HTTP server, it
 * exposes a WebSocket at /__acorn_harness and bridges:
 *
 *     renderer  <--WS frames-->  sidecar  <--ACP JSON-RPC/stdio-->  agent
 *
 * Per renderer connection it lazily spawns ONE agent (ACORN_HARNESS_CMD) and
 * drives it via @zed-industries/agent-client-protocol's ClientSideConnection.
 * It is plain Node CommonJS (never bundled into the renderer); the WS frame
 * shapes mirror web/src/harness/protocol.ts.
 *
 * Pure config: with no ACORN_HARNESS_CMD set, it tells the renderer the harness
 * is unavailable (so the chat UI hides). The harness:claude / harness:gemini /
 * harness:openrouter dev scripts set that env.
 */
const fs = require('fs')
const { spawn } = require('child_process')
const { Readable, Writable } = require('node:stream')
const { WebSocketServer } = require('ws')

const HARNESS_PATH = '/__acorn_harness'

// The ACP SDK is ESM-only; load it once via dynamic import from this CJS module.
let acpPromise = null
const loadAcp = () => {
  if (!acpPromise)
    acpPromise = import('@zed-industries/agent-client-protocol')
  return acpPromise
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

/**
 * Drives one agent process + ACP connection for one renderer WebSocket.
 */
class HarnessConnection {
  constructor(ws) {
    this.ws = ws
    this.child = null
    this.agent = null // ClientSideConnection (implements the ACP Agent role)
    this.nextPermissionId = 1
    this.pendingPermissions = new Map() // requestId -> resolve
    this.treeContextBySession = new Map() // sessionId -> ACP ContentBlock (seed once)
  }

  send(frame) {
    if (this.ws.readyState === this.ws.OPEN) this.ws.send(JSON.stringify(frame))
  }

  // Build the ACP Client handler the agent calls back into.
  makeClient() {
    return {
      sessionUpdate: async (params) => {
        const update = toHarnessUpdate(params.update)
        if (update) this.send({ t: 'update', sessionId: params.sessionId, update })
      },
      requestPermission: async (params) => {
        const requestId = this.nextPermissionId++
        const tc = params.toolCall || {}
        this.send({
          t: 'permissionRequest',
          requestId,
          sessionId: params.sessionId,
          request: {
            toolCall: { toolCallId: tc.toolCallId, title: tc.title || '', kind: tc.kind },
            options: params.options || [],
          },
        })
        const decision = await new Promise((resolve) =>
          this.pendingPermissions.set(requestId, resolve)
        )
        return { outcome: decision }
      },
      readTextFile: async (params) => {
        const content = fs.readFileSync(params.path, 'utf8')
        return { content }
      },
      writeTextFile: async (params) => {
        fs.writeFileSync(params.path, params.content)
        return null
      },
    }
  }

  async ensureAgent() {
    if (this.agent) return this.agent
    const cmd = process.env.ACORN_HARNESS_CMD
    if (!cmd || !cmd.trim()) {
      throw new Error(
        'No LLM harness configured. Set ACORN_HARNESS_CMD (or run yarn harness:claude / harness:gemini / harness:openrouter).'
      )
    }
    const acp = await loadAcp()
    // shell:true so ACORN_HARNESS_CMD can be a full command line with args.
    this.child = spawn(cmd, { shell: true, stdio: ['pipe', 'pipe', 'inherit'] })
    this.child.on('error', (e) =>
      this.send({ t: 'unavailable', reason: `failed to spawn agent: ${e.message}` })
    )
    this.child.on('exit', () => {
      this.agent = null
    })
    const input = Readable.toWeb(this.child.stdout)
    const output = Writable.toWeb(this.child.stdin)
    const stream = acp.ndJsonStream(output, input)
    this.agent = new acp.ClientSideConnection(() => this.makeClient(), stream)
    this.acp = acp
    return this.agent
  }

  async handle(frame) {
    try {
      switch (frame.t) {
        case 'initialize': {
          const agent = await this.ensureAgent()
          const res = await agent.initialize({
            protocolVersion: this.acp.PROTOCOL_VERSION,
            clientCapabilities: {
              fs: { readTextFile: true, writeTextFile: true },
              terminal: false,
            },
          })
          this.send({
            t: 'initialized',
            id: frame.id,
            info: {
              protocolVersion: res.protocolVersion,
              agentName: res.agentInfo && res.agentInfo.name,
            },
          })
          return
        }
        case 'newSession': {
          const agent = await this.ensureAgent()
          const res = await agent.newSession({ cwd: frame.cwd || process.cwd(), mcpServers: [] })
          if (frame.treeContext)
            this.treeContextBySession.set(res.sessionId, toAcpBlock(frame.treeContext))
          this.send({ t: 'sessionCreated', id: frame.id, sessionId: res.sessionId })
          return
        }
        case 'prompt': {
          const blocks = (frame.blocks || []).map(toAcpBlock)
          // Seed the live tree as the first turn's leading context, once.
          const seed = this.treeContextBySession.get(frame.sessionId)
          if (seed) {
            blocks.unshift(seed)
            this.treeContextBySession.delete(frame.sessionId)
          }
          const res = await this.agent.prompt({ sessionId: frame.sessionId, prompt: blocks })
          this.send({ t: 'turnEnd', id: frame.id, stopReason: res.stopReason })
          return
        }
        case 'cancel': {
          if (this.agent) this.agent.cancel({ sessionId: frame.sessionId })
          return
        }
        case 'permissionDecision': {
          const resolve = this.pendingPermissions.get(frame.requestId)
          if (resolve) {
            this.pendingPermissions.delete(frame.requestId)
            resolve(frame.decision)
          }
          return
        }
      }
    } catch (e) {
      if (frame && frame.id != null)
        this.send({ t: 'error', id: frame.id, message: String((e && e.message) || e) })
      else this.send({ t: 'unavailable', reason: String((e && e.message) || e) })
    }
  }

  dispose() {
    for (const resolve of this.pendingPermissions.values()) resolve({ outcome: 'cancelled' })
    this.pendingPermissions.clear()
    if (this.child) {
      try {
        this.child.kill()
      } catch (_) {}
    }
  }
}

/**
 * Attach the harness WS server to the dev-server's HTTP server.
 * Idempotent per server (guards against repeated setupMiddlewares calls).
 */
function attachHarnessSidecar(server) {
  if (!server || server.__acornHarnessAttached) return
  server.__acornHarnessAttached = true
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
    const conn = new HarnessConnection(ws)
    if (!process.env.ACORN_HARNESS_CMD || !process.env.ACORN_HARNESS_CMD.trim()) {
      conn.send({
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
      conn.handle(frame)
    })
    ws.on('close', () => conn.dispose())
  })
  // eslint-disable-next-line no-console
  console.log(
    `[acorn-harness] WebSocket on ${HARNESS_PATH}` +
      (process.env.ACORN_HARNESS_CMD
        ? ` (agent: ${process.env.ACORN_HARNESS_CMD})`
        : ' (no ACORN_HARNESS_CMD — harness unavailable)')
  )
}

module.exports = { attachHarnessSidecar, HARNESS_PATH }
