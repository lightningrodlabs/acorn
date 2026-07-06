/**
 * Tests for the harness's uniform prompt-context composition
 * (web/dev-harness/promptContext.js): the Acorn system prompt + skill are
 * delivered as inline text on a session's first turn, and embedded resources are
 * flattened to text, for EVERY backend — so a model never depends on an agent
 * honoring `_meta.systemPrompt` or `resource` blocks (OpenCode honors neither).
 */
// CommonJS module loaded by the (CommonJS) sidecar — require it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  flattenResourceBlock,
  flattenResourceBlocks,
  composeFirstPrompt,
  composeTurn,
} = require('../dev-harness/promptContext')

const resource = (uri: string, text: string) => ({
  type: 'resource',
  resource: { uri, mimeType: 'text/markdown', text },
})
const text = (t: string) => ({ type: 'text', text: t })

describe('flattenResourceBlock', () => {
  it('turns a resource block into text with a uri header', () => {
    expect(flattenResourceBlock(resource('acorn://skill', 'BODY'))).toEqual({
      type: 'text',
      text: '[embedded resource: acorn://skill]\nBODY',
    })
  })

  it('passes a text block through unchanged and is idempotent', () => {
    const t = text('hi')
    expect(flattenResourceBlock(t)).toBe(t)
    const once = flattenResourceBlocks([resource('u', 'b')])
    expect(flattenResourceBlocks(once)).toEqual(once) // flattening again is a no-op
  })
})

describe('composeFirstPrompt', () => {
  it('leads with the system prompt, then skill, then the user blocks — all text', () => {
    const blocks = composeFirstPrompt({
      userBlocks: [text('who are you?')],
      skillBlocks: [text('SKILL PREAMBLE'), resource('acorn://skill', 'SKILL BODY')],
      systemText: 'You are the Acorn assistant.',
    })
    // order: system, skill preamble, skill body, user — and nothing is a resource
    expect(blocks.map((b: any) => b.type)).toEqual(['text', 'text', 'text', 'text'])
    expect(blocks[0].text).toBe('You are the Acorn assistant.')
    expect(blocks[1].text).toBe('SKILL PREAMBLE')
    expect(blocks[2].text).toContain('SKILL BODY') // resource flattened to text
    expect(blocks[3].text).toBe('who are you?')
  })

  it('omits the system block when no system text is configured', () => {
    const blocks = composeFirstPrompt({
      userBlocks: [text('hi')],
      skillBlocks: [text('SKILL')],
      systemText: null,
    })
    expect(blocks.map((b: any) => b.text)).toEqual(['SKILL', 'hi'])
  })

  it('works with no skill (e.g. skill file missing) — still injects system text', () => {
    const blocks = composeFirstPrompt({
      userBlocks: [text('hi')],
      skillBlocks: [],
      systemText: 'You are Acorn.',
    })
    expect(blocks.map((b: any) => b.text)).toEqual(['You are Acorn.', 'hi'])
  })
})

describe('composeTurn (subsequent prompts)', () => {
  it('adds no lead but still flattens a per-turn resource (e.g. updated tree)', () => {
    const blocks = composeTurn([resource('acorn://tree/p', '{"tree":1}'), text('go')])
    expect(blocks.map((b: any) => b.type)).toEqual(['text', 'text'])
    expect(blocks[0].text).toContain('{"tree":1}')
    expect(blocks[1].text).toBe('go')
  })
})
