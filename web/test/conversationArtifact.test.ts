import { SessionRecord } from '../src/harness/chatHistory'
import { buildTranscript } from '../src/harness/transcript'
import {
  CONVERSATION_ARTIFACT_TYPE,
  conversationTranscript,
  isConversationArtifact,
  makeConversationArtifact,
} from '../src/harness/conversationArtifact'

const session: SessionRecord = {
  id: 'ses-1',
  title: 'Flesh out branch-transcript',
  updatedAt: 1,
  messages: [
    { id: 1, role: 'user', text: 'hello', at: 10 },
    { id: 2, role: 'agent', text: 'hi', at: 20 },
  ],
}

describe('conversation artifact', () => {
  it('makes a conversation artifact carrying the serialized transcript', () => {
    const t = buildTranscript(session, 99)
    const a = makeConversationArtifact('', t)
    expect(a.type).toBe(CONVERSATION_ARTIFACT_TYPE)
    expect(a.label).toBe('Flesh out branch-transcript') // falls back to title
    expect(isConversationArtifact(a)).toBe(true)
  })

  it('round-trips: the artifact parses back to an equal transcript', () => {
    const t = buildTranscript(session, 99)
    const a = makeConversationArtifact('My chat', t)
    expect(conversationTranscript(a)).toEqual(t)
    expect(a.label).toBe('My chat')
  })

  it('is not a conversation artifact when the type differs', () => {
    const a = { type: 'workproduct', label: 'x', uri: 'web/src/foo.ts' }
    expect(isConversationArtifact(a)).toBe(false)
    expect(conversationTranscript(a)).toBeNull()
  })

  it('degrades to null (not throw) when the value is not a transcript', () => {
    const a = { type: CONVERSATION_ARTIFACT_TYPE, label: 'broken', uri: 'not json' }
    expect(isConversationArtifact(a)).toBe(true)
    expect(conversationTranscript(a)).toBeNull()
  })

  it('handles null/undefined safely', () => {
    expect(isConversationArtifact(undefined)).toBe(false)
    expect(conversationTranscript(null)).toBeNull()
  })
})
