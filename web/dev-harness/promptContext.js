/*
 * Uniform delivery of the Acorn "preamble" (system prompt + clarity-trees skill)
 * and per-turn context to ANY ACP backend.
 *
 * ACP defines two OPTIONAL channels for out-of-band context — `_meta.systemPrompt`
 * on session/new, and embedded `resource` content blocks — but agents disagree on
 * (and misreport) support for them. OpenCode advertises
 * `promptCapabilities.embeddedContext` and accepts `_meta`, yet forwards NEITHER
 * to its model: a session that relies on them gets no Acorn context at all (the
 * model answers "who are you?" as a generic assistant). The one channel every ACP
 * agent reliably forwards to its model is ordinary user prompt TEXT.
 *
 * So we deliver the preamble + per-turn context as inline text on the first prompt
 * of each session, for ALL backends — the same way regardless of agent. The
 * sidecar still sends `_meta.systemPrompt` on session/new as an ADDITIONAL identity
 * override for agents that honor it (claude-agent-acp drops its "You are Claude
 * Code" preset), but no backend depends on it for the actual working context.
 *
 * Plain Node CommonJS (required by the CommonJS sidecar), pure + injectable so the
 * composition is unit-testable without a running agent.
 */

// Inline a single embedded `resource` block as a plain text block (with a small
// header naming its uri, so the model can still tell where it came from).
// Non-resource blocks pass through unchanged.
function flattenResourceBlock(b) {
  if (b && b.type === 'resource' && b.resource) {
    const header = b.resource.uri ? `[embedded resource: ${b.resource.uri}]\n` : ''
    return { type: 'text', text: header + (b.resource.text || '') }
  }
  return b
}

// Flatten every embedded resource block in a list to text. Idempotent: text
// blocks are returned as-is, so it's safe to apply more than once.
function flattenResourceBlocks(blocks) {
  return (blocks || []).map(flattenResourceBlock)
}

/**
 * Blocks for a session's FIRST prompt: the Acorn system prompt (if any) as a
 * leading text block, then the skill blocks, then the user's own blocks — all
 * flattened to text so they reach the model on every backend (no dependence on
 * `_meta` or `resource` support).
 *
 * @param {object} args
 * @param {Array}  args.userBlocks   the turn's own ACP content blocks
 * @param {Array}  [args.skillBlocks] skill blocks (see skill.js skillPromptBlocks)
 * @param {?string}[args.systemText]  the Acorn system prompt text, or null
 */
function composeFirstPrompt({ userBlocks = [], skillBlocks = [], systemText = null }) {
  const lead = [...skillBlocks]
  if (systemText && systemText.trim()) {
    lead.unshift({ type: 'text', text: systemText })
  }
  return flattenResourceBlocks([...lead, ...userBlocks])
}

// Blocks for every SUBSEQUENT prompt: just the user's blocks, still flattened so
// a per-turn resource (e.g. an updated tree snapshot) lands as text everywhere.
function composeTurn(userBlocks = []) {
  return flattenResourceBlocks(userBlocks)
}

module.exports = {
  flattenResourceBlock,
  flattenResourceBlocks,
  composeFirstPrompt,
  composeTurn,
}
