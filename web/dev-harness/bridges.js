/*
 * The agent-diff HTTP bridges, shared by the webpack dev server (webpack.dev.js
 * setupMiddlewares) and the standalone harness host (host.js). Extracted verbatim
 * from webpack.dev.js so both hosts serve identical behavior; plain (req,res,next)
 * middlewares with no framework dependency.
 *
 *   /__acorn_diff/<name>        GET/POST the exchange file (read/write under a
 *                               durable dir — ?dir=<abs> — or /tmp/acorn-clarity)
 *   /__acorn_diff_locate        GET  ?name=<x.json> → { matches: [abs…] }
 *   /__acorn_diff_locate_dir    POST {root, files} → { matches: [abs…] }
 */
const fs = require('fs')
const path = require('path')
const os = require('os')

// fallback dir, fixed (NOT os.tmpdir(): under `nix develop` TMPDIR is
// per-session). The renderer passes ?dir=<abs> to keep a project's exchange
// files somewhere durable — next to the originally imported tree file —
// instead of tmpfs, which a reboot wipes.
const DEFAULT_DIR = '/tmp/acorn-clarity'

const dirFor = (req) => {
  const q = new URL(req.url, 'http://localhost').searchParams.get('dir')
  return q && path.isAbsolute(q) ? path.normalize(q) : DEFAULT_DIR
}
const fileFor = (name, dir) =>
  path.join(dir, path.basename(String(name)).replace(/[^a-z0-9._-]/gi, '_'))
const json = (res, code, obj) => {
  res.statusCode = code
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

// read/write the exchange file. Must run BEFORE any SPA history-fallback (which
// would otherwise serve index.html for the GET).
function diffBridgeMiddleware(req, res, next) {
  const m = req.url.match(/^\/__acorn_diff\/([^/?#]+)/)
  if (!m) return next()
  const dir = dirFor(req)
  const file = fileFor(decodeURIComponent(m[1]), dir)
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(file)) return json(res, 404, { error: 'not found' })
      res.setHeader('content-type', 'application/json')
      return res.end(fs.readFileSync(file, 'utf8'))
    } catch (e) {
      return json(res, 500, { error: String(e) })
    }
  }
  if (req.method === 'POST') {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(file, body)
        json(res, 200, { ok: true, path: file })
      } catch (e) {
        json(res, 500, { error: String(e) })
      }
    })
    return
  }
  next()
}

// locate the originally imported tree file by basename, so exports can land
// next to it. Bounded walk from the repo root; also serves as the renderer's
// "is the bridge up at all" probe (no bridge → no prompt).
function diffLocateMiddleware(req, res, next) {
  if (!req.url.startsWith('/__acorn_diff_locate?')) return next()
  const name = new URL(req.url, 'http://localhost').searchParams.get('name')
  if (!name) return json(res, 400, { error: 'name required' })
  const target = path.basename(name)
  const SKIP = new Set([
    'node_modules',
    '.git',
    'dist',
    'target',
    '.cargo',
    '.cache',
  ])
  const matches = []
  const walk = (d, depth) => {
    if (depth > 6 || matches.length > 10) return
    let entries
    try {
      entries = fs.readdirSync(d, { withFileTypes: true })
    } catch (_) {
      return
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!SKIP.has(e.name)) walk(path.join(d, e.name), depth + 1)
      } else if (e.name === target) {
        matches.push(path.join(d, e.name))
      }
    }
  }
  // repo root (this file lives in web/dev-harness/)
  walk(path.resolve(__dirname, '..', '..'), 0)
  return json(res, 200, { matches })
}

// resolve a folder the renderer picked with a webkitdirectory input to an
// absolute path: webviews hide file paths from JS, but the pick DOES yield
// the folder's name + its contained (relative) file names — enough for a
// bounded disk walk to find it.
function diffLocateDirMiddleware(req, res, next) {
  if (!req.url.startsWith('/__acorn_diff_locate_dir')) return next()
  if (req.method !== 'POST') return next()
  let body = ''
  req.setEncoding('utf8')
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    try {
      const { root, files } = JSON.parse(body || '{}')
      if (!root || typeof root !== 'string')
        return json(res, 400, { error: 'root required' })
      const sample = (Array.isArray(files) ? files : [])
        .filter((f) => typeof f === 'string' && f && !f.includes('..'))
        .slice(0, 5)
      const SKIP = new Set(['node_modules', 'dist', 'target', 'snap'])
      const matches = []
      const walk = (d, depth) => {
        if (depth > 7 || matches.length > 10) return
        let entries
        try {
          entries = fs.readdirSync(d, { withFileTypes: true })
        } catch (_) {
          return
        }
        for (const e of entries) {
          if (!e.isDirectory()) continue
          if (e.name.startsWith('.') || SKIP.has(e.name)) continue
          const full = path.join(d, e.name)
          if (
            e.name === root &&
            sample.every((f) => fs.existsSync(path.join(full, f)))
          ) {
            matches.push(full)
          }
          walk(full, depth + 1)
        }
      }
      walk(os.homedir(), 0)
      return json(res, 200, { matches: matches.slice(0, 10) })
    } catch (e) {
      return json(res, 500, { error: String(e) })
    }
  })
}

module.exports = {
  diffBridgeMiddleware,
  diffLocateMiddleware,
  diffLocateDirMiddleware,
}
