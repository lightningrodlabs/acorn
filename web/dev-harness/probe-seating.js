/*
 * probe-seating — answer the agent-definition-seating unknown for OpenCode
 * ([[backend-agent-seating]]): does `opencode acp` actually run under the Acorn
 * system prompt seated by systemSlot.js, or does its built-in coding-agent
 * persona win?
 *
 * The seating MECHANISM is built (systemSlot.js: top-level `instructions` +
 * `agent.build.prompt` in a generated effective config) and unit-tested, but it
 * was never verified against a live `opencode acp` — this probe is that
 * verification, headless, without touching a running sidecar.
 *
 * Method (default, hermetic): seat a SENTINEL system prompt through the same
 * buildOpenCodeConfig the sidecar uses, but point the provider at a local
 * CAPTURE server speaking the OpenAI chat-completions shape. When opencode
 * sends the model request we inspect the actual `messages` — whether any
 * system-role content carries the sentinel, and how much non-Acorn system text
 * surrounds it. Deterministic: no ollama, no model-quality noise.
 *
 * Method (--live): same seating, real ollama model, ask "What are you?" and
 * look for the sentinel in the reply. Noisier (a small model may ignore the
 * instruction) — use it only as an end-to-end smoke check.
 *
 * Usage (from web/):
 *   node dev-harness/probe-seating.js                 # capture, both levers
 *   node dev-harness/probe-seating.js --lever=instructions
 *   node dev-harness/probe-seating.js --lever=agent
 *   node dev-harness/probe-seating.js --lever=none    # negative control
 *   node dev-harness/probe-seating.js --live          # real-model smoke check
 *
 * Env: ACORN_HARNESS_CMD overrides the agent command (default `opencode acp`);
 * OPENCODE_CONFIG overrides the base config (default dev-harness/opencode.local.json).
 */
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { Readable, Writable } = require('node:stream')
const { buildOpenCodeConfig, OPENCODE_PRIMARY_AGENT } = require('./systemSlot')

const TIMEOUT_MS = 300_000
const TOKEN = 'ACORN-SEATED'
const SENTINEL = [
  'You are the Acorn assistant — the agent embedded in Acorn, a tool for',
  'building clarity trees. You are NOT a coding agent.',
  `IMPORTANT: whenever you are asked what you are, your reply MUST contain the exact token ${TOKEN}.`,
  'Answer questions in one or two sentences. Do not use any tools.',
].join('\n')
const QUESTION = 'What are you? Answer in one or two sentences. Do not use any tools.'

const lever = (process.argv.find((a) => a.startsWith('--lever=')) || '--lever=both')
  .split('=')[1]
const live = process.argv.includes('--live')
const cmd = process.env.ACORN_HARNESS_CMD || 'opencode acp'
const baseConfigPath =
  process.env.OPENCODE_CONFIG || path.join(__dirname, 'opencode.local.json')

/**
 * A minimal OpenAI-chat-completions capture server: records every request body
 * and answers a fixed completion (SSE when stream:true). Lets us see exactly
 * what system text opencode puts in front of the model.
 */
function startCaptureServer(captured) {
  const http = require('http')
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      let parsed = null
      try {
        parsed = JSON.parse(body)
      } catch (_) {}
      if (parsed && parsed.messages) captured.push(parsed)
      const stream = parsed && parsed.stream
      if (stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' })
        const chunk = (delta, finish) =>
          `data: ${JSON.stringify({
            id: 'probe',
            object: 'chat.completion.chunk',
            created: 0,
            model: (parsed && parsed.model) || 'probe',
            choices: [{ index: 0, delta, finish_reason: finish || null }],
          })}\n\n`
        res.write(chunk({ role: 'assistant', content: 'ok' }))
        res.write(chunk({}, 'stop'))
        res.write('data: [DONE]\n\n')
        res.end()
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            id: 'probe',
            object: 'chat.completion',
            created: 0,
            model: (parsed && parsed.model) || 'probe',
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: 'ok' },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          })
        )
      }
    })
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, url: `http://127.0.0.1:${server.address().port}/v1` })
    )
  })
}

function effectiveConfig(baseURLOverride) {
  const base = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'))
  const tmp = '/tmp/acorn-harness/probe-seating'
  fs.mkdirSync(tmp, { recursive: true })
  const promptPath = path.join(tmp, 'sentinel-prompt.md')
  fs.writeFileSync(promptPath, SENTINEL)
  // eslint-disable-next-line no-unused-vars
  const { instructions, ...rest } = base
  let cfg
  if (lever === 'both') {
    cfg = buildOpenCodeConfig(base, SENTINEL, promptPath) // exactly what the sidecar seats
  } else if (lever === 'instructions') {
    cfg = { ...rest, instructions: [promptPath] }
  } else if (lever === 'agent') {
    cfg = {
      ...rest,
      agent: {
        ...(base.agent || {}),
        [OPENCODE_PRIMARY_AGENT]: { prompt: SENTINEL },
      },
    }
  } else if (lever === 'none') {
    cfg = rest // negative control: no seating at all
  } else {
    console.error(`unknown --lever=${lever} (both|instructions|agent|none)`)
    process.exit(2)
  }
  // The committed config's project-relative mcp command misresolves from the
  // agent cwd and is irrelevant to seating — drop it so the probe is hermetic.
  delete cfg.mcp
  if (baseURLOverride) {
    // Route every configured provider at the capture server.
    for (const p of Object.values(cfg.provider || {})) {
      p.options = { ...(p.options || {}), baseURL: baseURLOverride }
    }
  }
  const out = path.join(tmp, `opencode.effective.${lever}.json`)
  fs.writeFileSync(out, JSON.stringify(cfg, null, 2))
  return out
}

async function main() {
  const captured = []
  let capture = null
  if (!live) capture = await startCaptureServer(captured)
  const configPath = effectiveConfig(capture && capture.url)
  console.log(
    `mode=${live ? 'live' : 'capture'}  lever=${lever}  cmd="${cmd}"\nOPENCODE_CONFIG=${configPath}\n`
  )
  const acp = await import('@agentclientprotocol/sdk')
  const child = spawn(cmd, {
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, OPENCODE_CONFIG: configPath },
  })
  child.on('error', (e) => {
    console.error(`failed to spawn agent: ${e.message}`)
    process.exit(2)
  })

  let reply = ''
  const client = {
    sessionUpdate: async (params) => {
      const u = params.update || {}
      const kind = u.sessionUpdate || u.type
      if (kind === 'agent_message_chunk' && u.content && u.content.text) {
        reply += u.content.text
        process.stdout.write(u.content.text)
      } else if (kind && kind !== 'agent_thought_chunk') {
        console.log(`  [${kind}]`)
      }
    },
    requestPermission: async (params) => {
      const allow = (params.options || []).find((o) =>
        String(o.kind || '').startsWith('allow')
      )
      return {
        outcome: allow
          ? { outcome: 'selected', optionId: allow.optionId }
          : { outcome: 'cancelled' },
      }
    },
    readTextFile: async () => {
      throw new Error('probe has no fs')
    },
    writeTextFile: async () => {
      throw new Error('probe has no fs')
    },
  }

  const conn = new acp.ClientSideConnection(
    () => client,
    acp.ndJsonStream(Writable.toWeb(child.stdin), Readable.toWeb(child.stdout))
  )
  const init = await conn.initialize({
    protocolVersion: acp.PROTOCOL_VERSION,
    clientCapabilities: { fs: { readTextFile: false, writeTextFile: false } },
  })
  console.log(`agent: ${(init.agentInfo && init.agentInfo.name) || cmd}`)

  const killer = setTimeout(() => {
    console.error(`\nno reply after ${TIMEOUT_MS / 1000}s — giving up`)
    child.kill()
    process.exit(1)
  }, TIMEOUT_MS)

  const { sessionId } = await conn.newSession({ cwd: process.cwd(), mcpServers: [] })
  console.log(`session: ${sessionId}\nasking: ${QUESTION}\n---`)
  const r = await conn.prompt({
    sessionId,
    prompt: [{ type: 'text', text: QUESTION }],
  })
  clearTimeout(killer)
  console.log(`\n---\nstopReason: ${r.stopReason}`)

  let seated
  if (live) {
    // Live mode: the model's self-description is the (noisy) signal.
    seated = reply.includes(TOKEN)
    const codingPersona =
      /coding (agent|assistant)|opencode|software engineer/i.test(reply)
    console.log(
      `\nVERDICT (live, lever=${lever}): ${
        seated
          ? `SEATED — reply carries ${TOKEN}; the Acorn definition owns the session`
          : codingPersona
            ? 'NOT SEATED — built-in coding-agent persona answered; the lever(s) had no effect'
            : `INCONCLUSIVE — no ${TOKEN} but no coding persona either; read the reply above`
    }`
    )
  } else {
    // Capture mode: judge from what opencode actually sent the model.
    // opencode also fires internal requests (e.g. a thread-title generator
    // whose INPUT quotes the user question) — report every captured request,
    // then judge the MAIN turn: question in a user message AND not an internal
    // title/summarize request.
    const text = (m) =>
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '')
    const sysTextOf = (r) =>
      (r.messages || [])
        .filter((m) => m.role === 'system')
        .map(text)
        .join('\n')
    const dump = path.join(
      '/tmp/acorn-harness/probe-seating',
      `captured.${lever}.json`
    )
    fs.writeFileSync(dump, JSON.stringify(captured, null, 2))
    console.log(`\ncaptured ${captured.length} request(s) (full dump: ${dump}):`)
    captured.forEach((r, i) => {
      const msgs = r.messages || []
      const systems = msgs.filter((m) => m.role === 'system')
      console.log(
        `  [${i}] model=${r.model} messages=${msgs.length} (${systems.length} system)`
      )
      systems.forEach((m, j) => {
        const t = text(m)
        console.log(
          `      system[${j}] ${t.length} chars — ${
            t.includes(TOKEN) ? 'CARRIES SENTINEL' : 'no sentinel'
          }: "${t.slice(0, 100).replace(/\n/g, ' ')}…"`
        )
      })
    })
    const main = captured.find(
      (r) =>
        (r.messages || []).some(
          (m) => m.role === 'user' && text(m).includes('What are you?')
        ) && !/^You are a title generator/i.test(sysTextOf(r))
    )
    if (!main) {
      console.log(
        `\nVERDICT: NO MAIN REQUEST CAPTURED — internal request(s) only; opencode never sent the user turn to the provider`
      )
      seated = false
    } else {
      const sysText = sysTextOf(main)
      const sentinelSeated = sysText.includes(TOKEN)
      const inlineOnly =
        !sentinelSeated &&
        (main.messages || []).some(
          (m) => m.role !== 'system' && text(m).includes(TOKEN)
        )
      // The builtin persona PROMPT starts "You are opencode" — the bare word
      // "opencode" also appears in benign appended text (skills list), so match
      // the prompt opener, not the word.
      const builtin = /You are opencode|coding agent(?! persona)/i.test(sysText)
      seated = sentinelSeated
      console.log(
        `\nVERDICT (capture, lever=${lever}): ${
          sentinelSeated
            ? `SEATED — the sentinel reaches the model's system slot${
                builtin
                  ? ' (built-in persona text is ALSO present — check which dominates)'
                  : ''
              }`
            : inlineOnly
              ? 'NOT SEATED — sentinel only appears inline (non-system role); the system slot is not ours'
              : builtin
                ? 'NOT SEATED — only the built-in persona reaches the model'
                : 'NOT SEATED — sentinel absent from the system slot'
        }`
      )
    }
  }
  if (capture) capture.server.close()
  child.kill()
  process.exit(seated ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
