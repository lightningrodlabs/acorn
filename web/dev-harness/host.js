#!/usr/bin/env node
/*
 * Standalone harness host — webpack-dev-server's seat, without webpack.
 *
 * Serves the BUILT UI (web/dist, from webpack.standalone.js) plus everything the
 * dev server provided to the harness, on the same origin, so the renderer needs
 * no URL/CORS awareness and hc-spin's `--ui-port` flow works unchanged:
 *
 *   • static files over web/dist with SPA fallback to index.html
 *   • WS /__acorn_harness  — the sidecar (ACP agent / direct backend), unchanged
 *   • POST /__acorn_tool   — hosted-MCP relay (read_tree / propose_edits)
 *   • /__acorn_diff*       — agent-diff exchange-file bridges (bridges.js)
 *
 * Run: node web/dev-harness/host.js   (port from WEB_PORT, default 8081; all
 * sidecar env — ACORN_HARNESS_CMD, ACORN_SYSTEM_PROMPT_FILE, ACORN_OPENAI_* —
 * exactly as in dev). Plain Node CJS, no webpack/Electron coupling: this file is
 * the embeddable unit for a future Kangaroo/Tauri main-process integration.
 */
const fs = require('fs')
const http = require('http')
const path = require('path')
const { attachHarnessSidecar, toolBridgeMiddleware } = require('./sidecar')
const {
  diffBridgeMiddleware,
  diffLocateMiddleware,
  diffLocateDirMiddleware,
} = require('./bridges')

const PORT = Number(process.env.WEB_PORT || 8081)
// ACORN_STATIC_DIR: test/embedding override for the served directory
const DIST = process.env.ACORN_STATIC_DIR
  ? path.resolve(process.env.ACORN_STATIC_DIR)
  : path.resolve(__dirname, '..', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}

// Static file server over DIST with SPA fallback: any GET that doesn't resolve
// to a file gets index.html (react-router paths). Terminal — never calls next.
function staticMiddleware(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    return res.end('method not allowed')
  }
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch (_) {
    res.statusCode = 400
    return res.end('bad request')
  }
  let file = path.normalize(path.join(DIST, pathname))
  // path-traversal guard: everything served must stay under DIST
  if (!file.startsWith(DIST + path.sep) && file !== DIST) {
    res.statusCode = 403
    return res.end('forbidden')
  }
  if (file === DIST || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html')
  }
  if (!fs.existsSync(file)) {
    res.statusCode = 404
    return res.end(
      'index.html not found — run the standalone build first (yarn standalone:build)'
    )
  }
  res.statusCode = 200
  res.setHeader(
    'content-type',
    MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'
  )
  fs.createReadStream(file).pipe(res)
}

// The same chain shape webpack.dev.js unshifts, ending in the static server.
const chain = [
  toolBridgeMiddleware,
  diffLocateDirMiddleware,
  diffLocateMiddleware,
  diffBridgeMiddleware,
  staticMiddleware,
]

function handle(req, res) {
  let i = 0
  const next = () => {
    const mw = chain[i++]
    if (!mw) {
      res.statusCode = 404
      return res.end('not found')
    }
    mw(req, res, next)
  }
  next()
}

// Exported for tests; listens only when run directly.
function createHostServer() {
  const server = http.createServer(handle)
  attachHarnessSidecar(server)
  return server
}

if (require.main === module) {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    // eslint-disable-next-line no-console
    console.warn(
      `[acorn-host] ${DIST}/index.html missing — run \`yarn standalone:build\` (serving harness endpoints anyway)`
    )
  }
  const server = createHostServer()
  server.listen(PORT, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`[acorn-host] serving ${DIST} on http://localhost:${PORT}`)
  })
}

module.exports = { createHostServer, staticMiddleware, handle }
