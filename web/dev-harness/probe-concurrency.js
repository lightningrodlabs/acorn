/*
 * probe-concurrency — answer the concurrent-sessions unknown for a REAL backend:
 * does the agent run two ACP `session/prompt`s in parallel, or queue them
 * internally? (One agent process, many sessions — the protocol allows either.)
 *
 * The session registry works either way; what changes is UI honesty: if a
 * backend queues, the second session should say "queued behind session A"
 * instead of silently thinking. Run this once per backend and record the
 * verdict on the clarity-tree task.
 *
 * Usage (same env the sidecar uses):
 *   ACORN_HARNESS_CMD="npx @zed-industries/claude-code-acp" node dev-harness/probe-concurrency.js
 *   ACORN_HARNESS_CMD="opencode acp" node dev-harness/probe-concurrency.js
 *
 * Method: open two sessions, fire both prompts in the same tick, timestamp every
 * session/update. If session B streams anything before session A's turn ends
 * (and vice-versa checks out), the backend is PARALLEL; if B's first update
 * only lands after A's turnEnd, it QUEUES. The prompt asks for a slow count so
 * each turn spans several chunks — a one-chunk answer can't show interleaving.
 */
const { spawn } = require('child_process')
const { Readable, Writable } = require('node:stream')

const TIMEOUT_MS = 180_000
const PROMPT =
  'Count from 1 to 8, one number per line, no other text. Do not use any tools.'

const cmd = process.env.ACORN_HARNESS_CMD
if (!cmd || !cmd.trim()) {
  console.error(
    'Set ACORN_HARNESS_CMD to the ACP agent command line (as the dev harness does).'
  )
  process.exit(2)
}

async function main() {
  const acp = await import('@agentclientprotocol/sdk')
  const child = spawn(cmd, {
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit'],
    env: process.env,
  })
  child.on('error', (e) => {
    console.error(`failed to spawn agent: ${e.message}`)
    process.exit(2)
  })

  const t0 = Date.now()
  const events = [] // { at, sessionId, what }
  const note = (sessionId, what) => {
    events.push({ at: Date.now() - t0, sessionId, what })
  }

  // Minimal ACP client: record updates, auto-allow permissions (counting needs
  // none, but a backend may still ask), no fs.
  const client = {
    sessionUpdate: async (params) => {
      const u = params.update || {}
      note(params.sessionId, u.sessionUpdate || u.type || 'update')
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
  const agentName = (init.agentInfo && init.agentInfo.name) || cmd
  console.log(`agent: ${agentName}`)

  const mk = () => conn.newSession({ cwd: process.cwd(), mcpServers: [] })
  const { sessionId: A } = await mk()
  const { sessionId: B } = await mk()
  const tag = (id) => (id === A ? 'A' : id === B ? 'B' : id)
  console.log(`sessions: A=${A} B=${B}\nprompting both in the same tick…\n`)

  const turn = (sessionId) =>
    conn
      .prompt({ sessionId, prompt: [{ type: 'text', text: PROMPT }] })
      .then((r) => note(sessionId, `turnEnd(${r.stopReason})`))
      .catch((e) => note(sessionId, `turnError(${e.message || e})`))

  const killer = setTimeout(() => {
    console.error(`\nno verdict after ${TIMEOUT_MS / 1000}s — giving up`)
    report()
    process.exit(1)
  }, TIMEOUT_MS)

  await Promise.all([turn(A), turn(B)])
  clearTimeout(killer)
  report()
  child.kill()
  process.exit(0)

  function report() {
    console.log('timeline (ms):')
    for (const e of events)
      console.log(`  ${String(e.at).padStart(6)}  ${tag(e.sessionId)}  ${e.what}`)

    const endOf = (id) => {
      const e = events.find(
        (x) => x.sessionId === id && x.what.startsWith('turnEnd')
      )
      return e ? e.at : Infinity
    }
    const firstUpdateOf = (id) => {
      const e = events.find(
        (x) => x.sessionId === id && !x.what.startsWith('turnEnd')
      )
      return e ? e.at : Infinity
    }
    // Interleaved = the two turns' [first update, turnEnd] intervals OVERLAP.
    // Both conditions must hold: with a queued backend, the first turn still
    // starts before the second one ends, so an OR would misreport PARALLEL.
    const interleaved =
      firstUpdateOf(B) < endOf(A) && firstUpdateOf(A) < endOf(B)
    console.log(
      `\nVERDICT for ${agentName}: ${
        interleaved
          ? 'PARALLEL — turns interleave; no queue hint needed'
          : 'QUEUES — second prompt waits for the first turn; the UI should say "queued behind session …"'
      }`
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
