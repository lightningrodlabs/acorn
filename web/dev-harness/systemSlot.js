/*
 * System-slot delivery adapters — seat the Acorn system prompt in a backend's
 * AUTHORITATIVE system slot when that backend has one and we know how to reach it
 * ("when possible"). This is the high-quality channel; inline delivery
 * (promptContext.js) is the universal FLOOR underneath, so a backend with no
 * adapter still gets the prompt + skill as first-turn text — no regression.
 *
 * There is no ACP standard for a system prompt, and agents misreport their
 * capabilities (OpenCode advertises `_meta`/`embeddedContext` yet honors
 * neither), so adapters are EXPLICIT, not detected. Config-based backends must be
 * configured BEFORE spawn — before `agentInfo.name` is known — so adapters match
 * on the harness command. Adding a backend is one entry here.
 *
 * Channels by backend:
 *   - claude-agent-acp: ACP `_meta.systemPrompt` on session/new — handled
 *     per-session in sidecar.js (it needs the live prompt object), not here.
 *   - OpenCode: its config. We generate an effective config that carries the
 *     Acorn prompt through TWO levers and point OPENCODE_CONFIG at it:
 *       1. top-level `instructions: [<abs prompt file>]` — the PRIMARY lever.
 *          OpenCode's ACP mode has a bug (sst/opencode#8680) where it ignores the
 *          configured default agent and runs whatever agent is first in state
 *          (often a subagent), so an `agent.*.prompt` override may never be the
 *          agent in play. `instructions` apply to the model regardless of agent,
 *          so they survive that bug. Written to an ABSOLUTE path so nothing
 *          resolves against the agent's `web/` cwd.
 *       2. `agent.build.prompt` — secondary insurance for when ACP honors the
 *          primary agent (or #8680 is fixed): a full system-prompt replace.
 *
 * Plain Node CommonJS (required by the CommonJS sidecar); the config transform is
 * pure + the IO is injectable, so it's unit-testable without spawning anything.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

// OpenCode's default primary agent — the one its ACP/headless mode runs. Override
// its `prompt` and we own the system slot. (If a future OpenCode build runs a
// different primary, change this one constant.)
const OPENCODE_PRIMARY_AGENT = 'build'

/**
 * Pure: an effective OpenCode config that seats the Acorn prompt via two levers
 * (see module header): top-level `instructions: [promptPath]` (primary — survives
 * the ACP default-agent bug) and `agent.build.prompt` = `systemText` (secondary).
 * Preserves provider/model/mcp/$schema. Replaces any committed `instructions`
 * (its project-relative path misresolves against the agent's cwd). `promptPath`
 * should be ABSOLUTE; omit it to set only the agent lever.
 */
function buildOpenCodeConfig(baseConfig, systemText, promptPath, acornMcp) {
  const base = baseConfig && typeof baseConfig === 'object' ? baseConfig : {}
  // eslint-disable-next-line no-unused-vars
  const { instructions, ...rest } = base
  const agent = base.agent || {}
  const cfg = {
    ...rest,
    agent: {
      ...agent,
      [OPENCODE_PRIMARY_AGENT]: {
        ...(agent[OPENCODE_PRIMARY_AGENT] || {}),
        prompt: systemText,
      },
    },
  }
  if (promptPath) cfg.instructions = [promptPath]
  // Register Acorn's hosted tools with an ABSOLUTE command. The committed
  // config's `mcp.acorn` uses a project-relative path that OpenCode resolves
  // against its own cwd (→ `web/web/…`, ENOENT), so the tool server never starts
  // and `read_tree`/`propose_edits` never reach the model. The sidecar knows the
  // absolute path; overriding it here is what actually attaches the tools, since
  // OpenCode also ignores servers passed over ACP `session/new`.
  if (acornMcp) cfg.mcp = { ...(base.mcp || {}), acorn: acornMcp }
  return cfg
}

function readJsonSafe(file, io) {
  try {
    return file ? JSON.parse(io.readFileSync(file, 'utf8')) : {}
  } catch (_) {
    return {}
  }
}

const ADAPTERS = [
  {
    name: 'opencode',
    // Config-based ⇒ matched pre-spawn off the command / its config env var.
    matches: ({ cmd, env }) =>
      /\bopencode\b/i.test(cmd || '') || !!(env && env.OPENCODE_CONFIG),
    prepare: ({ env, systemText, tmpdir, io, opencodeAcornMcp }) => {
      if (!systemText || !systemText.trim()) return null
      const base = readJsonSafe(env.OPENCODE_CONFIG, io)
      // Absolute path so OpenCode's `instructions` resolution never depends on cwd.
      const promptPath = path.join(tmpdir, 'acorn-system-prompt.generated.md')
      io.writeFileSync(promptPath, systemText)
      const effective = buildOpenCodeConfig(
        base,
        systemText,
        promptPath,
        opencodeAcornMcp
      )
      const out = path.join(tmpdir, 'opencode.effective.json')
      io.writeFileSync(out, JSON.stringify(effective, null, 2))
      const mcpNote = opencodeAcornMcp ? ' + mcp.acorn (absolute)' : ''
      return {
        env: { ...env, OPENCODE_CONFIG: out },
        note: `OpenCode system slot: instructions=[${promptPath}] + agent.${OPENCODE_PRIMARY_AGENT}.prompt${mcpNote} via generated config ${out}`,
      }
    },
  },
]

/**
 * Seat the system prompt in the backend's system slot when an adapter matches.
 * Returns `{ env, note }`: `env` is the (possibly patched) environment to spawn
 * the agent with; `note` is a one-line log string (or null when no adapter ran).
 *
 * @param {object}  a
 * @param {string}  a.cmd         the harness command (ACORN_HARNESS_CMD)
 * @param {object}  a.env         the base environment (usually process.env)
 * @param {?string} a.systemText  the resolved Acorn system prompt, or null
 * @param {string}  [a.tmpdir]    where generated configs are written
 * @param {object}  [a.io]        { readFileSync, writeFileSync } (injectable)
 */
function prepareSystemSlot({ cmd, env, systemText, tmpdir, io, opencodeAcornMcp }) {
  const _io = io || fs
  const _env = env || {}
  const _tmp = tmpdir || os.tmpdir()
  for (const a of ADAPTERS) {
    if (!a.matches({ cmd, env: _env })) continue
    const r = a.prepare({
      env: _env,
      systemText,
      tmpdir: _tmp,
      io: _io,
      opencodeAcornMcp,
    })
    if (r) return r
  }
  return { env: _env, note: null }
}

module.exports = {
  prepareSystemSlot,
  buildOpenCodeConfig,
  ADAPTERS,
  OPENCODE_PRIMARY_AGENT,
}
