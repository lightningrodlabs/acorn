import {
  upsertConversationArtifact,
  findConversationHolders,
  makeConversationReference,
  isConversationRef,
  conversationRefTarget,
} from '../src/harness/conversationDedup'
import { makeConversationArtifact } from '../src/harness/conversationArtifact'
import { serializeFields } from '../src/outcomeFields'
import { Transcript } from '../src/harness/transcript'

const transcript = (sessionId: string, turns = 1): Transcript => ({
  version: 1,
  sessionId,
  title: `session ${sessionId}`,
  capturedAt: 1,
  turns: Array.from({ length: turns }, (_, i) => ({
    role: 'user' as const,
    content: `turn ${i}`,
  })),
})

const convArtifact = (sessionId: string, turns = 1) =>
  makeConversationArtifact(`conv ${sessionId}`, transcript(sessionId, turns))

describe('upsertConversationArtifact (grow, never duplicate)', () => {
  it('appends when the session is not present', () => {
    const out = upsertConversationArtifact([], convArtifact('S1'))
    expect(out).toHaveLength(1)
  })

  it('replaces the same session in place rather than appending (grow)', () => {
    const first = convArtifact('S1', 1)
    const grown = convArtifact('S1', 5) // same session, fuller transcript
    const out = upsertConversationArtifact([first], grown)
    expect(out).toHaveLength(1)
    expect(out[0]).toBe(grown)
  })

  it('leaves other sessions and non-conversation artifacts untouched', () => {
    const other = convArtifact('S2')
    const doc = { type: 'doc', label: 'd', uri: 'x' }
    const out = upsertConversationArtifact([doc, other], convArtifact('S1'))
    expect(out).toHaveLength(3)
    expect(out[0]).toBe(doc)
    expect(out[1]).toBe(other)
  })
})

describe('findConversationHolders', () => {
  const tree = {
    outcomes: {
      A: { description: serializeFields({ outcome: 'a', artifacts: [convArtifact('S1')] }) },
      B: { description: serializeFields({ outcome: 'b', artifacts: [convArtifact('S2')] }) },
      C: { description: serializeFields({ outcome: 'c', artifacts: [convArtifact('S1')] }) },
      D: { description: serializeFields({ outcome: 'd' }) }, // no artifacts
    },
  }

  it('finds every node holding a given session', () => {
    expect(findConversationHolders(tree, 'S1').sort()).toEqual(['A', 'C'])
  })
  it('finds the single holder of another session', () => {
    expect(findConversationHolders(tree, 'S2')).toEqual(['B'])
  })
  it('returns empty for a session held nowhere', () => {
    expect(findConversationHolders(tree, 'S9')).toEqual([])
    expect(findConversationHolders(tree, '')).toEqual([])
  })
})

describe('conversation reference (point, do not copy)', () => {
  it('make / detect / target round-trips', () => {
    const ref = makeConversationReference('branch-transcript', 'see it there')
    expect(isConversationRef(ref)).toBe(true)
    expect(conversationRefTarget(ref)).toBe('branch-transcript')
  })
  it('a plain conversation artifact is not a reference', () => {
    expect(isConversationRef(convArtifact('S1'))).toBe(false)
    expect(conversationRefTarget(convArtifact('S1'))).toBeNull()
  })
})
