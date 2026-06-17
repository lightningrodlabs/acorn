/*
 * The clarity-trees skill the harness loads on every tree-editing session.
 *
 * The skill (clarity-engine/clarity-tree-skill.md) is the craft an agent needs
 * to read, propose, and grow a clarity tree soundly — the ontology, the
 * structural invariants, decomposition, spec placement, and the working loop.
 * The sidecar injects it as a leading block on the first prompt of each session
 * (see sidecar.js), so the agent has it in context for the whole conversation
 * without re-sending it every turn.
 *
 * Plain Node CommonJS (required by the CommonJS sidecar), pure + injectable so
 * its loading is unit-testable without a running agent.
 */
const fs = require('fs')
const path = require('path')

// The committed skill file, relative to this module (web/dev-harness/).
const DEFAULT_SKILL_PATH = path.join(
  __dirname,
  '..',
  '..',
  'clarity-engine',
  'clarity-tree-skill.md'
)

const SKILL_URI = 'acorn://skill/clarity-trees'

const SKILL_PREAMBLE =
  'CLARITY-TREES SKILL — load and follow this before you read, propose, or ' +
  'build out the clarity tree. It defines what a clarity tree is and the craft ' +
  'of growing one soundly; treat its invariants as binding for any tree edit.'

// Resolve the skill path: explicit option > ACORN_SKILL_PATH env > committed default.
function resolveSkillPath(opts = {}) {
  if (opts.path) return opts.path
  const env = process.env.ACORN_SKILL_PATH
  return env && env.trim() ? env : DEFAULT_SKILL_PATH
}

// Read the skill markdown. Returns null (never throws) when the file is missing,
// so an absent skill degrades to "no skill injected" rather than a broken prompt.
function loadSkill(opts = {}) {
  const p = resolveSkillPath(opts)
  try {
    return fs.readFileSync(p, 'utf8')
  } catch (_) {
    if (opts.warn) opts.warn(`[acorn-harness] skill file not found at ${p}`)
    return null
  }
}

// The ACP prompt blocks that inject the skill: a short binding instruction plus
// the skill itself as a resource. Returns [] when no skill is available, so the
// caller can spread it unconditionally.
function skillPromptBlocks(opts = {}) {
  const text = opts.text !== undefined ? opts.text : loadSkill(opts)
  if (!text) return []
  return [
    { type: 'text', text: SKILL_PREAMBLE },
    { type: 'resource', resource: { uri: SKILL_URI, mimeType: 'text/markdown', text } },
  ]
}

module.exports = {
  loadSkill,
  skillPromptBlocks,
  resolveSkillPath,
  SKILL_URI,
  SKILL_PREAMBLE,
  DEFAULT_SKILL_PATH,
}
