/**
 * Tests for the harness MCP server config (web/dev-harness/mcpConfig.js): env
 * interpolation, validation/skip behavior, and the agent-capability-gated mapping
 * to the ACP wire shape (native http/sse vs stdio mcp-remote bridge).
 */
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'

// CommonJS module loaded by the (CommonJS) sidecar — require it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadMcpServers, toAcpServers } = require('../dev-harness/mcpConfig')

const silent = () => {}

function writeConfig(obj: unknown): string {
  const p = path.join(
    os.tmpdir(),
    `acorn-mcp-test-${Math.random().toString(36).slice(2)}.json`
  )
  fs.writeFileSync(p, JSON.stringify(obj))
  return p
}

describe('loadMcpServers', () => {
  it('returns [] when the config file is absent', () => {
    expect(
      loadMcpServers({ path: '/no/such/acorn-mcp.json', warn: silent })
    ).toEqual([])
  })

  it('returns [] on invalid JSON (logged, not thrown)', () => {
    const p = path.join(os.tmpdir(), `acorn-mcp-bad-${Date.now()}.json`)
    fs.writeFileSync(p, '{ not json')
    expect(loadMcpServers({ path: p, warn: silent })).toEqual([])
  })

  it('interpolates ${VAR} from env into header values', () => {
    const p = writeConfig({
      servers: [
        {
          name: 'linear',
          type: 'http',
          url: 'https://mcp.linear.app/mcp',
          headers: { Authorization: 'Bearer ${LINEAR_API_KEY}' },
        },
      ],
    })
    const servers = loadMcpServers({
      path: p,
      env: { LINEAR_API_KEY: 'lin_api_xyz' },
      warn: silent,
    })
    expect(servers).toEqual([
      {
        name: 'linear',
        type: 'http',
        url: 'https://mcp.linear.app/mcp',
        headers: [{ name: 'Authorization', value: 'Bearer lin_api_xyz' }],
      },
    ])
  })

  it('skips a server whose referenced env var is unset (keeps the rest)', () => {
    const warn = jest.fn()
    const p = writeConfig({
      servers: [
        {
          name: 'linear',
          type: 'http',
          url: 'https://mcp.linear.app/mcp',
          headers: { Authorization: 'Bearer ${LINEAR_API_KEY}' },
        },
        { name: 'local', type: 'stdio', command: 'foo' },
      ],
    })
    const servers = loadMcpServers({ path: p, env: {}, warn })
    expect(servers.map((s: any) => s.name)).toEqual(['local'])
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('skipping mcp server "linear"')
    )
  })

  it('normalizes a stdio server with env pairs', () => {
    const p = writeConfig({
      servers: [
        {
          name: 'foo',
          type: 'stdio',
          command: 'npx',
          args: ['-y', 'some-mcp'],
          env: { TOKEN: '${FOO_TOKEN}' },
        },
      ],
    })
    expect(
      loadMcpServers({ path: p, env: { FOO_TOKEN: 't0ken' }, warn: silent })
    ).toEqual([
      {
        name: 'foo',
        type: 'stdio',
        command: 'npx',
        args: ['-y', 'some-mcp'],
        env: [{ name: 'TOKEN', value: 't0ken' }],
      },
    ])
  })

  it('skips unknown types and dedupes by name', () => {
    const warn = jest.fn()
    const p = writeConfig({
      servers: [
        { name: 'a', type: 'http', url: 'https://a' },
        { name: 'a', type: 'http', url: 'https://a-dup' },
        { name: 'b', type: 'carrier-pigeon', url: 'https://b' },
        { type: 'stdio', command: 'x' }, // missing name
      ],
    })
    const servers = loadMcpServers({ path: p, env: {}, warn })
    expect(servers.map((s: any) => s.name)).toEqual(['a'])
    expect((servers[0] as any).url).toBe('https://a') // first wins
  })
})

describe('toAcpServers', () => {
  const linear = {
    name: 'linear',
    type: 'http',
    url: 'https://mcp.linear.app/mcp',
    headers: [{ name: 'Authorization', value: 'Bearer tok' }],
  }

  it('passes a stdio server through unchanged (no type field)', () => {
    const stdio = {
      name: 'foo',
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'm'],
      env: [{ name: 'T', value: '1' }],
    }
    expect(toAcpServers([stdio], { http: true })).toEqual([
      { name: 'foo', command: 'npx', args: ['-y', 'm'], env: [{ name: 'T', value: '1' }] },
    ])
  })

  it('forwards http natively when the agent advertises http MCP support', () => {
    expect(toAcpServers([linear], { http: true })).toEqual([
      {
        type: 'http',
        name: 'linear',
        url: 'https://mcp.linear.app/mcp',
        headers: [{ name: 'Authorization', value: 'Bearer tok' }],
      },
    ])
  })

  it('bridges http through stdio mcp-remote when http is unsupported', () => {
    expect(toAcpServers([linear], {})).toEqual([
      {
        name: 'linear',
        command: 'npx',
        args: [
          '-y',
          'mcp-remote',
          'https://mcp.linear.app/mcp',
          '--header',
          'Authorization: Bearer tok',
        ],
        env: [],
      },
    ])
  })

  it('bridges http when no capabilities object is given at all', () => {
    const [mapped] = toAcpServers([linear], undefined)
    expect(mapped.command).toBe('npx')
    expect(mapped.args).toContain('mcp-remote')
  })
})
