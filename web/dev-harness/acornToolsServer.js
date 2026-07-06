/*
 * acornToolsServer — the ACORN-HOSTED MCP server (clarity-tree draft pipeline L1
 * + the sibling read leaf). It is spawned as a stdio child of the ACP agent (the
 * sidecar attaches it to every session via the mcpServers seam) and exposes two
 * callable tools:
 *
 *   read_tree()          → the live ProjectSnapshot (collections keyed by actionHash)
 *   propose_edits(diff)  → open an inert DRAFT from a ProjectDiff. This NEVER
 *                          writes to the DHT; a human Confirms it in the app. This
 *                          is the load-bearing invariant of the whole layer.
 *
 * It owns no Acorn state itself — the store lives in the renderer. Each tools/call
 * is bridged over HTTP to the dev-server (/__acorn_tool), which the sidecar relays
 * to the renderer and back. So the data path is:
 *
 *   agent --MCP/stdio--> THIS --HTTP--> sidecar --WS--> renderer (redux store)
 *
 * Deliberately dependency-free: MCP's stdio transport is newline-delimited
 * JSON-RPC 2.0, which we speak by hand (no @modelcontextprotocol/sdk to install).
 * stdout is the protocol channel — all logging goes to stderr.
 */
const http = require('http')
const readline = require('readline')

const WEB_PORT = process.env.ACORN_WEB_PORT || '8081'
const DEFAULT_PROTOCOL = '2024-11-05'

const log = (...a) => process.stderr.write('[acorn-tools] ' + a.join(' ') + '\n')

// --- the tool surface (mirrors src/harness/acornTools.ts names) --------------
const PROJECT_DIFF_SCHEMA = {
  type: 'object',
  description:
    'A ProjectDiff: per-collection added/updated/removed entries, keyed by actionHash. ' +
    'New nodes use a synthetic placeholder hash (e.g. "draft:1"); connections link ' +
    'parentActionHash → childActionHash. Only outcomes/connections/tags/outcomeMembers/' +
    'outcomeComments/entryPoints are diffable.',
  properties: Object.fromEntries(
    [
      'outcomes',
      'connections',
      'tags',
      'outcomeMembers',
      'outcomeComments',
      'entryPoints',
    ].map((c) => [
      c,
      {
        type: 'object',
        properties: {
          added: { type: 'object' },
          updated: { type: 'object' },
          removed: { type: 'array', items: { type: 'string' } },
        },
      },
    ])
  ),
}

const TOOLS = [
  {
    name: 'read_tree',
    description:
      'Read the live clarity tree as a ProjectSnapshot (collections keyed by actionHash). ' +
      'Call this to get current state before proposing edits.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'propose_edits',
    description:
      'Propose a set of edits to the tree as a ProjectDiff. This opens a DRAFT the ' +
      'human reviews and confirms in the app — it does NOT write to the tree directly. ' +
      'Returns immediately once the draft is open.',
    inputSchema: {
      type: 'object',
      properties: { diff: PROJECT_DIFF_SCHEMA },
      required: ['diff'],
    },
  },
]

// --- HTTP bridge to the sidecar ----------------------------------------------
function bridge(tool, args) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ tool, args })
    const req = http.request(
      {
        host: '127.0.0.1',
        port: WEB_PORT,
        path: '/__acorn_tool',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (c) => (body += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            resolve({ ok: false, error: `bad bridge response: ${body.slice(0, 200)}` })
          }
        })
      }
    )
    req.on('error', (e) =>
      resolve({ ok: false, error: `cannot reach Acorn dev server: ${e.message}` })
    )
    req.write(payload)
    req.end()
  })
}

// --- JSON-RPC plumbing -------------------------------------------------------
function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n')
}
function reply(id, result) {
  send({ jsonrpc: '2.0', id, result })
}
function replyError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } })
}

async function handleToolCall(id, params) {
  const name = params && params.name
  const args = (params && params.arguments) || {}
  const tool = TOOLS.find((t) => t.name === name)
  if (!tool) return replyError(id, -32602, `unknown tool: ${name}`)

  const res = await bridge(name, args)
  if (!res || res.ok === false) {
    reply(id, {
      content: [{ type: 'text', text: (res && res.error) || 'tool failed' }],
      isError: true,
    })
    return
  }
  const text =
    typeof res.result === 'string' ? res.result : JSON.stringify(res.result)
  reply(id, { content: [{ type: 'text', text }] })
}

async function handle(msg) {
  const { id, method, params } = msg
  switch (method) {
    case 'initialize':
      reply(id, {
        protocolVersion: (params && params.protocolVersion) || DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: 'acorn', version: '0.1.0' },
      })
      return
    case 'notifications/initialized':
    case 'initialized':
      return // notification — no response
    case 'tools/list':
      reply(id, { tools: TOOLS })
      return
    case 'tools/call':
      await handleToolCall(id, params)
      return
    case 'ping':
      reply(id, {})
      return
    default:
      // unknown request → method-not-found; ignore notifications (no id)
      if (id !== undefined && id !== null)
        replyError(id, -32601, `method not found: ${method}`)
      return
  }
}

// Run the stdio JSON-RPC server only when invoked as a script (the ACP agent
// spawns it). When `require`d (e.g. the direct backend needs the TOOLS schemas),
// just export and do NOT touch stdin.
if (require.main === module) {
  const rl = readline.createInterface({ input: process.stdin })
  rl.on('line', (line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    let msg
    try {
      msg = JSON.parse(trimmed)
    } catch (e) {
      log('parse error:', e.message)
      return
    }
    Promise.resolve(handle(msg)).catch((e) => {
      log('handler error:', e && e.message)
      if (msg && msg.id != null) replyError(msg.id, -32603, String(e && e.message))
    })
  })

  log(`ready (bridge → http://127.0.0.1:${WEB_PORT}/__acorn_tool)`)
}

module.exports = { TOOLS, PROJECT_DIFF_SCHEMA }
