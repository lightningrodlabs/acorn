import { OutcomeComment } from '../../types'
import { AgentPubKeyB64, WithActionHash } from '../../types/shared'

/**
 * Only a comment's author may change it. The projects zome has no validation,
 * so the conductor would accept anyone's edit or delete; the UI is where this
 * is enforced. Imported comments were written by an agent of another install,
 * so nobody here is their author.
 */
export function canModifyComment(
  comment: OutcomeComment,
  agentPubKey: AgentPubKeyB64
): boolean {
  return !comment.isImported && comment.creatorAgentPubKey === agentPubKey
}

/** The comment's entry with new text; author, card and time are unchanged. */
export function commentWithContent(
  comment: WithActionHash<OutcomeComment>,
  content: string
): OutcomeComment {
  const { actionHash, ...entry } = comment
  return { ...entry, content }
}
