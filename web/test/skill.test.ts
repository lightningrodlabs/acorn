/**
 * Tests for the harness clarity-trees skill loader (web/dev-harness/skill.js):
 * path resolution, missing-file tolerance, and the ACP prompt-block shape the
 * sidecar injects on a session's first prompt.
 */
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'

// CommonJS module loaded by the (CommonJS) sidecar — require it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  loadSkill,
  skillPromptBlocks,
  resolveSkillPath,
  SKILL_URI,
  SKILL_PREAMBLE,
  DEFAULT_SKILL_PATH,
} = require('../dev-harness/skill')

const silent = () => {}

function writeSkill(text: string): string {
  const p = path.join(
    os.tmpdir(),
    `acorn-skill-test-${Math.random().toString(36).slice(2)}.md`
  )
  fs.writeFileSync(p, text)
  return p
}

describe('loadSkill', () => {
  it('returns the file contents for an explicit path', () => {
    const p = writeSkill('# clarity skill\nbody')
    expect(loadSkill({ path: p })).toBe('# clarity skill\nbody')
  })

  it('returns null (does not throw) when the file is absent', () => {
    expect(loadSkill({ path: '/no/such/skill.md', warn: silent })).toBeNull()
  })

  it('defaults to the committed clarity-engine skill file, which exists and is non-empty', () => {
    const text = fs.readFileSync(DEFAULT_SKILL_PATH, 'utf8')
    expect(text.length).toBeGreaterThan(0)
    expect(loadSkill()).toBe(text)
  })
})

describe('resolveSkillPath', () => {
  it('prefers an explicit path over the default', () => {
    expect(resolveSkillPath({ path: '/x/y.md' })).toBe('/x/y.md')
  })

  it('falls back to the committed default', () => {
    const prev = process.env.ACORN_SKILL_PATH
    delete process.env.ACORN_SKILL_PATH
    expect(resolveSkillPath()).toBe(DEFAULT_SKILL_PATH)
    if (prev !== undefined) process.env.ACORN_SKILL_PATH = prev
  })
})

describe('skillPromptBlocks', () => {
  it('returns a binding instruction text block + the skill as a markdown resource', () => {
    const blocks = skillPromptBlocks({ text: '# skill\ncontent' })
    expect(blocks).toEqual([
      { type: 'text', text: SKILL_PREAMBLE },
      {
        type: 'resource',
        resource: {
          uri: SKILL_URI,
          mimeType: 'text/markdown',
          text: '# skill\ncontent',
        },
      },
    ])
  })

  it('returns [] when no skill is available, so it can be spread unconditionally', () => {
    expect(skillPromptBlocks({ path: '/no/such/skill.md', warn: silent })).toEqual([])
    expect(skillPromptBlocks({ text: null })).toEqual([])
  })
})
