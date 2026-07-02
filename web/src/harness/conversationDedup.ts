/**
 * Keeping conversations canonical (the dedup leaf, #499545).
 *
 * A captured conversation is stored ONCE. This module holds the pure rules that
 * keep it that way:
 *   • upsertConversationArtifact — re-attaching the SAME session (matched by
 *     transcript.sessionId) REPLACES its existing artifact in place, so a growing
 *     conversation never spawns parallel near-identical copies (GROW, not append).
 *   • findConversationHolders — which node(s) in the tree already hold a given
 *     session's conversation, so the attach control can warn instead of copying.
 *   • conversation-ref — a lightweight REFERENCE artifact: a node that wants to
 *     point at a conversation held elsewhere links to the holder by [[ref]]
 *     (handle or hashCodeId) rather than storing its own copy.
 *
 * Pure and React-free so it is unit-testable on its own.
 */

import { OutcomeArtifact } from '../outcomeFields'
import { parseFields } from '../outcomeFields'
import {
  isConversationArtifact,
  conversationTranscript,
} from './conversationArtifact'

/** A reference to a conversation held on another node — never a copy. */
export const CONVERSATION_REF_TYPE = 'conversation-ref'

export function isConversationRef(a: OutcomeArtifact | undefined | null): boolean {
  return !!a && a.type === CONVERSATION_REF_TYPE
}

/**
 * A reference artifact pointing at the node that holds the canonical
 * conversation. `holderRef` is a stable node ref (handle preferred, else
 * hashCodeId) that renders as a clickable [[ref]] link.
 */
export function makeConversationReference(
  holderRef: string,
  label: string
): OutcomeArtifact {
  return { type: CONVERSATION_REF_TYPE, label: label || 'conversation', uri: holderRef }
}

/** The holder ref a conversation-ref points at, or null. */
export function conversationRefTarget(
  a: OutcomeArtifact | undefined | null
): string | null {
  if (!isConversationRef(a)) return null
  const ref = ((a as OutcomeArtifact).uri || '').trim()
  return ref || null
}

/** sessionId carried by a conversation artifact (via its serialized transcript). */
function artifactSessionId(a: OutcomeArtifact): string | null {
  if (!isConversationArtifact(a)) return null
  return conversationTranscript(a)?.sessionId || null
}

/**
 * Insert or replace a conversation artifact in a node's artifacts list, matched
 * by transcript.sessionId: if the list already holds the same session, replace
 * it in place (the canonical copy GROWS); otherwise append. Non-conversation
 * artifacts and other sessions are left untouched. Pure — returns a new array.
 */
export function upsertConversationArtifact(
  artifacts: OutcomeArtifact[] | undefined,
  artifact: OutcomeArtifact
): OutcomeArtifact[] {
  const list = artifacts ? [...artifacts] : []
  const sessionId = artifactSessionId(artifact)
  if (!sessionId) return [...list, artifact]
  const idx = list.findIndex((a) => artifactSessionId(a) === sessionId)
  if (idx >= 0) {
    list[idx] = artifact
    return list
  }
  return [...list, artifact]
}

/** Minimal tree shape: node actionHash -> its serialized fields (description). */
export interface HolderTree {
  outcomes: Record<string, { description?: string } | undefined>
}

/**
 * The actionHashes of every node whose artifacts already hold a conversation for
 * `sessionId`. Used to detect that a session is already retained somewhere, so
 * the attach control can reference rather than copy. Pure.
 */
export function findConversationHolders(
  tree: HolderTree,
  sessionId: string
): string[] {
  const holders: string[] = []
  if (!sessionId || !tree || !tree.outcomes) return holders
  for (const [hash, outcome] of Object.entries(tree.outcomes)) {
    if (!outcome) continue
    let artifacts: OutcomeArtifact[] = []
    try {
      artifacts = parseFields(outcome.description || '').artifacts || []
    } catch {
      artifacts = []
    }
    if (artifacts.some((a) => artifactSessionId(a) === sessionId)) {
      holders.push(hash)
    }
  }
  return holders
}
