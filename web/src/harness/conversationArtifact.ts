/**
 * The 'conversation' artifact type: a typed artifact (branch E) whose value is a
 * captured chat Transcript, so the conversation that shaped a branch can live ON
 * the node as a readable thread rather than an opaque link.
 *
 * An OutcomeArtifact is {type, label, uri}. A conversation artifact reuses that
 * shape with type === 'conversation' and the serialized Transcript carried in
 * `uri` (it is the artifact's value, not an external link). These pure helpers
 * make/detect/parse one; the readable-thread rendering lives in the widget.
 */
import { OutcomeArtifact } from '../outcomeFields'
import { Transcript, parseTranscript, serializeTranscript } from './transcript'

export const CONVERSATION_ARTIFACT_TYPE = 'conversation'

/** True if this artifact is a captured conversation (vs an input/output link). */
export function isConversationArtifact(a: OutcomeArtifact | undefined | null): boolean {
  return !!a && a.type === CONVERSATION_ARTIFACT_TYPE
}

/** Build a conversation artifact carrying a serialized transcript as its value. */
export function makeConversationArtifact(
  label: string,
  transcript: Transcript
): OutcomeArtifact {
  return {
    type: CONVERSATION_ARTIFACT_TYPE,
    label: label || transcript.title || 'Conversation',
    uri: serializeTranscript(transcript),
  }
}

/**
 * Parse the transcript carried by a conversation artifact, or null if this isn't
 * a conversation artifact or its value isn't a well-formed transcript (so a
 * malformed one degrades to the plain link row instead of throwing).
 */
export function conversationTranscript(
  a: OutcomeArtifact | undefined | null
): Transcript | null {
  if (!isConversationArtifact(a)) return null
  try {
    return parseTranscript((a as OutcomeArtifact).uri)
  } catch (_) {
    return null
  }
}
