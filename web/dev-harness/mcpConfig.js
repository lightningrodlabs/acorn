/*
 * MCP server config — the generalizable, agent-agnostic surface for attaching
 * MCP servers (Linear, etc.) to whichever ACP agent the harness is running.
 *
 * WHY this is agent-agnostic by construction: ACP carries MCP servers from the
 * CLIENT to the AGENT in session/new (and session/load) via `mcpServers`. So
 * "attach a server" is the SAME operation for every agent — Claude, Gemini,
 * anything — and the sidecar only has to read a list and forward it. This module
 * owns that list: a JSON file the user edits today (Moss / Kangaroo can write the
 * same shape from a UI later — the schema is the contract), turned into the ACP
 * McpServer wire shape.
 *
 * The one per-agent subtlety is transport. stdio servers are universal. http/sse
 * servers are forwarded NATIVELY only if the attached agent advertised the
 * matching mcpCapability at initialize; otherwise they are transparently bridged
 * through a local stdio `mcp-remote` process, so even an stdio-only agent can
 * reach a remote server (e.g. Linear's hosted MCP).
 *
 * Plain Node CommonJS — loaded by the sidecar, never bundled into the renderer.
 *
 * File shape (web/dev-harness/mcp-servers.json; see the .example):
 *   {
 *     "servers": [
 *       { "name": "linear", "type": "http",
 *         "url": "https://mcp.linear.app/mcp",
 *         "headers": { "Authorization": "Bearer ${LINEAR_API_KEY}" } },
 *       { "name": "foo", "type": "stdio",
 *         "command": "npx", "args": ["-y", "some-mcp"],
 *         "env": { "TOKEN": "${FOO_TOKEN}" } }
 *     ]
 *   }
 * `${VAR}` is interpolated from the environment so no secret lives in the file.
 */
const fs = require('fs')
const path = require('path')

const DEFAULT_CONFIG_PATH = path.join(__dirname, 'mcp-servers.json')

/** The config file path — overridable with ACORN_MCP_CONFIG. */
function configPath() {
  const p = process.env.ACORN_MCP_CONFIG
  return p && p.trim() ? p : DEFAULT_CONFIG_PATH
}

// Replace ${VAR} from env. Throws if a referenced var is unset/empty so a
// misconfigured secret fails LOUDLY (caught per-server by the caller and the
// server skipped) instead of silently sending an empty Authorization header the
// agent would just reject.
function interpolate(str, env) {
  return str.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_m, name) => {
    const v = env[name]
    if (v == null || v === '')
      throw new Error(`references \${${name}} but that env var is unset`)
    return v
  })
}

function interpolateDeep(node, env) {
  if (typeof node === 'string') return interpolate(node, env)
  if (Array.isArray(node)) return node.map((n) => interpolateDeep(n, env))
  if (node && typeof node === 'object') {
    const out = {}
    for (const k of Object.keys(node)) out[k] = interpolateDeep(node[k], env)
    return out
  }
  return node
}

// A {name: value} object in the file -> the ACP {name, value}[] pair list used
// for both http headers and stdio env.
function toPairs(obj) {
  if (!obj) return []
  return Object.keys(obj).map((name) => ({ name, value: String(obj[name]) }))
}

function normalizeEntry(entry, env) {
  if (!entry || typeof entry !== 'object') throw new Error('not an object')
  if (!entry.name || typeof entry.name !== 'string')
    throw new Error('missing "name"')
  // Default the transport: a command implies stdio, a url implies http.
  const type =
    entry.type || (entry.command ? 'stdio' : entry.url ? 'http' : null)
  if (type === 'stdio') {
    if (!entry.command) throw new Error('stdio server needs "command"')
    return {
      name: entry.name,
      type: 'stdio',
      command: interpolate(entry.command, env),
      args: (entry.args || []).map((a) => interpolate(String(a), env)),
      env: toPairs(interpolateDeep(entry.env, env)),
    }
  }
  if (type === 'http' || type === 'sse') {
    if (!entry.url) throw new Error(`${type} server needs "url"`)
    return {
      name: entry.name,
      type,
      url: interpolate(entry.url, env),
      headers: toPairs(interpolateDeep(entry.headers, env)),
    }
  }
  throw new Error(`unknown type "${entry.type}" (use stdio | http | sse)`)
}

/**
 * Read the configured MCP servers, env-interpolated and validated, as a
 * normalized internal list ({name, type, ...}).
 *
 * NEVER throws: a missing file (the common case — no servers attached), invalid
 * JSON, or a single bad/duplicate entry is logged and skipped so the harness
 * still comes up. Options are injectable for tests.
 */
function loadMcpServers(opts) {
  const { env, path: p, warn } = {
    env: process.env,
    path: configPath(),
    warn: console.warn, // eslint-disable-line no-console
    ...(opts || {}),
  }
  let raw
  try {
    raw = fs.readFileSync(p, 'utf8')
  } catch (_) {
    return [] // no config file is normal — no servers attached
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    warn(`[acorn-harness] mcp-servers.json: invalid JSON — ${e.message}`)
    return []
  }
  const servers = parsed && Array.isArray(parsed.servers) ? parsed.servers : []
  const out = []
  const seen = new Set()
  for (const entry of servers) {
    try {
      const s = normalizeEntry(entry, env)
      if (seen.has(s.name)) {
        warn(`[acorn-harness] mcp server "${s.name}" duplicated — keeping the first`)
        continue
      }
      seen.add(s.name)
      out.push(s)
    } catch (e) {
      const label = (entry && entry.name) || '(unnamed)'
      warn(`[acorn-harness] skipping mcp server "${label}": ${e.message}`)
    }
  }
  return out
}

/**
 * Map normalized servers to the ACP McpServer wire shape, gated by what the
 * attached agent advertised (`mcpCapabilities` = { http?, sse? }):
 *   - stdio            -> passed as-is (universally supported)
 *   - http/sse, native -> { type, name, url, headers } when the cap is present
 *   - http/sse, else   -> bridged through a stdio `mcp-remote` process so an
 *                          agent without http/sse MCP support can still reach it
 */
function toAcpServers(servers, mcpCapabilities) {
  const caps = mcpCapabilities || {}
  return servers.map((s) => {
    if (s.type === 'stdio')
      return { name: s.name, command: s.command, args: s.args, env: s.env }
    const nativelySupported =
      (s.type === 'http' && caps.http) || (s.type === 'sse' && caps.sse)
    if (nativelySupported)
      return { type: s.type, name: s.name, url: s.url, headers: s.headers }
    // Bridge: a local `mcp-remote` speaks stdio to the agent and http/sse to the
    // remote server. Header values may contain spaces — fine, the agent spawns
    // argv directly (no shell), so each flag is one arg.
    const headerFlags = s.headers.flatMap((h) => [
      '--header',
      `${h.name}: ${h.value}`,
    ])
    return {
      name: s.name,
      command: 'npx',
      args: ['-y', 'mcp-remote', s.url, ...headerFlags],
      env: [],
    }
  })
}

module.exports = { loadMcpServers, toAcpServers, configPath }
