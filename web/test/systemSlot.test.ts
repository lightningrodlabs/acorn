/**
 * Tests for the harness system-slot adapters (web/dev-harness/systemSlot.js):
 * seating the Acorn system prompt in a backend's authoritative system slot when
 * an adapter exists ("when possible"), with inline delivery as the floor under
 * backends that have no adapter.
 */
// CommonJS module loaded by the (CommonJS) sidecar — require it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  prepareSystemSlot,
  buildOpenCodeConfig,
  OPENCODE_PRIMARY_AGENT,
} = require('../dev-harness/systemSlot')

describe('buildOpenCodeConfig', () => {
  const base = {
    $schema: 'https://opencode.ai/config.json',
    instructions: ['web/dev-harness/acorn-system-prompt.md'],
    provider: { ollama: { name: 'Ollama' } },
    model: 'ollama/lfm2.5:8b-a1b-q4_K_M',
    agent: { plan: { tools: { write: false } } },
  }

  it('replaces the primary agent prompt with the system text', () => {
    const cfg = buildOpenCodeConfig(base, 'You are the Acorn assistant.', '/abs/p.md')
    expect(cfg.agent[OPENCODE_PRIMARY_AGENT].prompt).toBe(
      'You are the Acorn assistant.'
    )
  })

  it('points instructions at the (absolute) generated prompt file', () => {
    const cfg = buildOpenCodeConfig(base, 'X', '/abs/p.md')
    expect(cfg.instructions).toEqual(['/abs/p.md']) // replaces the base relative path
  })

  it('registers mcp.acorn with the absolute command when provided', () => {
    const acorn = {
      type: 'local',
      command: ['/usr/bin/node', '/abs/dev-harness/acornToolsServer.js'],
      environment: { ACORN_WEB_PORT: '8081' },
      enabled: true,
    }
    const cfg = buildOpenCodeConfig(base, 'X', '/abs/p.md', acorn)
    expect(cfg.mcp.acorn).toEqual(acorn) // absolute path → OpenCode can actually spawn it
  })

  it('preserves provider/model/$schema and other agents', () => {
    const cfg = buildOpenCodeConfig(base, 'X', '/abs/p.md')
    expect(cfg.$schema).toBe(base.$schema)
    expect(cfg.provider).toEqual(base.provider)
    expect(cfg.model).toBe(base.model)
    expect(cfg.agent.plan).toEqual(base.agent.plan) // untouched
  })

  it('tolerates a missing/!object base config', () => {
    expect(
      buildOpenCodeConfig(undefined, 'X', '/abs/p.md').agent[OPENCODE_PRIMARY_AGENT]
        .prompt
    ).toBe('X')
  })
})

describe('prepareSystemSlot', () => {
  // capture writes without touching disk
  const makeIo = (files: Record<string, string> = {}) => {
    const writes: Record<string, string> = {}
    return {
      io: {
        readFileSync: (p: string) => {
          if (files[p] == null) throw new Error('ENOENT')
          return files[p]
        },
        writeFileSync: (p: string, data: string) => {
          writes[p] = data
        },
      },
      writes,
    }
  }

  it('patches OPENCODE_CONFIG to a generated config carrying the prompt', () => {
    const baseCfgPath = '/cfg/opencode.local.json'
    const { io, writes } = makeIo({
      [baseCfgPath]: JSON.stringify({ model: 'ollama/x' }),
    })
    const acorn = {
      type: 'local',
      command: ['/usr/bin/node', '/abs/acornToolsServer.js'],
      environment: { ACORN_WEB_PORT: '8081' },
      enabled: true,
    }
    const res = prepareSystemSlot({
      cmd: 'opencode acp',
      env: { OPENCODE_CONFIG: baseCfgPath },
      systemText: 'You are Acorn.',
      tmpdir: '/tmp/h',
      io,
      opencodeAcornMcp: acorn,
    })
    // env now points at the generated config...
    expect(res.env.OPENCODE_CONFIG).toBe('/tmp/h/opencode.effective.json')
    expect(res.note).toMatch(/OpenCode system slot/)
    // ...the prompt file was written next to it (absolute path)...
    const promptPath = '/tmp/h/acorn-system-prompt.generated.md'
    expect(writes[promptPath]).toBe('You are Acorn.')
    // ...and the config carries the prompt levers, absolute mcp.acorn, + base model
    const written = JSON.parse(writes['/tmp/h/opencode.effective.json'])
    expect(written.instructions).toEqual([promptPath])
    expect(written.agent[OPENCODE_PRIMARY_AGENT].prompt).toBe('You are Acorn.')
    expect(written.mcp.acorn).toEqual(acorn)
    expect(written.model).toBe('ollama/x')
  })

  it('matches OpenCode by OPENCODE_CONFIG even if the command does not name it', () => {
    const { io } = makeIo({ '/c.json': '{}' })
    const res = prepareSystemSlot({
      cmd: 'some-wrapper',
      env: { OPENCODE_CONFIG: '/c.json' },
      systemText: 'X',
      tmpdir: '/t',
      io,
    })
    expect(res.env.OPENCODE_CONFIG).toBe('/t/opencode.effective.json')
  })

  it('is a no-op (floor only) for a backend with no adapter', () => {
    const env = { ANTHROPIC_API_KEY: 'x' }
    const res = prepareSystemSlot({
      cmd: 'npx -y @agentclientprotocol/claude-agent-acp',
      env,
      systemText: 'X',
      tmpdir: '/t',
      io: makeIo().io,
    })
    expect(res.env).toBe(env) // unchanged
    expect(res.note).toBeNull()
  })

  it('is a no-op when there is no system text to seat', () => {
    const { io, writes } = makeIo({ '/c.json': '{}' })
    const res = prepareSystemSlot({
      cmd: 'opencode acp',
      env: { OPENCODE_CONFIG: '/c.json' },
      systemText: null,
      tmpdir: '/t',
      io,
    })
    expect(res.note).toBeNull()
    expect(Object.keys(writes)).toHaveLength(0) // nothing generated
  })
})
