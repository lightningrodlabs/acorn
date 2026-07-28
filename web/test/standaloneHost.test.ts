/**
 * The standalone harness host (dev-harness/host.js): HTTP routing through the
 * real middleware chain — static serving with SPA fallback, the agent-diff
 * exchange bridges, and the traversal guard. The WS sidecar behavior itself is
 * covered by the harness concurrency suites; here we only care that the host
 * wires the same chain webpack-dev-server does, minus webpack.
 */
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import type { Server } from 'http'

let server: Server
let base: string
let staticDir: string
let outsideSecret: string

beforeAll((done) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'acorn-host-test-'))
  staticDir = path.join(root, 'dist')
  fs.mkdirSync(staticDir)
  fs.writeFileSync(
    path.join(staticDir, 'index.html'),
    '<html>STANDALONE_INDEX</html>'
  )
  fs.writeFileSync(path.join(staticDir, 'app.js'), 'console.log("app")')
  // a file OUTSIDE the served dir that a traversal must never reach
  outsideSecret = path.join(root, 'secret.txt')
  fs.writeFileSync(outsideSecret, 'SECRET')
  process.env.ACORN_STATIC_DIR = staticDir
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHostServer } = require('../dev-harness/host')
  server = createHostServer()
  server.listen(0, '127.0.0.1', () => {
    const addr = server.address() as { port: number }
    base = `http://127.0.0.1:${addr.port}`
    done()
  })
})

afterAll((done) => {
  server.close(() => done())
})

describe('static serving', () => {
  it('serves index.html at /', async () => {
    const res = await fetch(`${base}/`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(await res.text()).toContain('STANDALONE_INDEX')
  })

  it('serves real files with their content type', async () => {
    const res = await fetch(`${base}/app.js`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('javascript')
    expect(await res.text()).toContain('console.log')
  })

  it('falls back to index.html for SPA routes', async () => {
    const res = await fetch(`${base}/project/abc123/map`)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('STANDALONE_INDEX')
  })

  it('never serves files outside the static dir', async () => {
    const res = await fetch(`${base}/..%2fsecret.txt`)
    const text = await res.text()
    expect(text).not.toContain('SECRET')
  })

  it('rejects non-GET methods on static paths', async () => {
    const res = await fetch(`${base}/whatever`, { method: 'POST' })
    expect(res.status).toBe(405)
  })
})

describe('agent-diff bridges', () => {
  it('round-trips an exchange file via POST then GET', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acorn-exchange-'))
    const q = `?dir=${encodeURIComponent(dir)}`
    const post = await fetch(`${base}/__acorn_diff/roundtrip.json${q}`, {
      method: 'POST',
      body: JSON.stringify({ hello: 'world' }),
    })
    expect(post.status).toBe(200)
    const posted = await post.json()
    expect(posted.ok).toBe(true)
    expect(posted.path).toBe(path.join(dir, 'roundtrip.json'))

    const get = await fetch(`${base}/__acorn_diff/roundtrip.json${q}`)
    expect(get.status).toBe(200)
    expect(await get.json()).toEqual({ hello: 'world' })
  })

  it('404s a missing exchange file (not the SPA fallback)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acorn-exchange-'))
    const res = await fetch(
      `${base}/__acorn_diff/nope.json?dir=${encodeURIComponent(dir)}`
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('not found')
  })

  it('locate-dir rejects a body without root', async () => {
    const res = await fetch(`${base}/__acorn_diff_locate_dir`, {
      method: 'POST',
      body: '{}',
    })
    expect(res.status).toBe(400)
  })

  it('locate answers the bridge-liveness probe shape', async () => {
    const res = await fetch(
      `${base}/__acorn_diff_locate?name=definitely-not-a-real-file-xyz.json`
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.matches)).toBe(true)
  })
})
