/**
 * read_tree — expose the live clarity tree to an LLM harness.
 *
 * This is the read half of the "LLM can interact directly with the tree via an
 * API" branch. It is deliberately a thin projection over the exporter: the agent
 * sees the SAME `ProjectSnapshot` shape the diff loop already produces and
 * understands (collections keyed by actionHash — see migrating/projectDiff.ts),
 * so there is one source of truth for "what the agent sees".
 *
 * Pure and synchronous (the data is already in the Redux store by the time a
 * project is open), so it is unit-testable in isolation and independent of the
 * harness transport.
 */
import hashCodeId from '../api/clientSideIdHash'
import { collectExportProjectData } from '../migrating/export'
import { ProjectSnapshot } from '../migrating/projectDiff'
import { RootState } from '../redux/reducer'
import { ActionHashB64, CellIdString } from '../types/shared'
import { parseFields, serializeFields } from '../outcomeFields'
import { isConversationArtifact } from './conversationArtifact'

/**
 * Drop captured conversation artifacts from one node's `description`.
 *
 * A conversation artifact carries an ENTIRE serialized transcript in its value,
 * so leaving them in the snapshot re-ships every attached conversation on every
 * tree read — huge, and almost never relevant to the current ask. Other artifact
 * types (input/output links) and every other field are preserved.
 *
 * Only re-serializes when a conversation artifact was actually present, so nodes
 * without one keep their exact description bytes (no lossy round-trip — which
 * also keeps the send-time change-detection diff stable).
 */
function stripConversationArtifacts(description: string): string {
  // Cheap guard: the type token is always present in a serialized conversation
  // artifact, so skip parsing descriptions that can't contain one.
  if (!description || description.indexOf('conversation') === -1)
    return description
  const fields = parseFields(description)
  const artifacts = fields.artifacts
  if (!artifacts || !artifacts.some(isConversationArtifact)) return description
  const kept = artifacts.filter((a) => !isConversationArtifact(a))
  const next = { ...fields }
  if (kept.length) next.artifacts = kept
  else delete next.artifacts
  return serializeFields(next)
}

/**
 * Re-insert the live node's conversation artifacts into an agent-proposed
 * description. Conversations are stripped from what the agent reads and are
 * human-owned, so an agent's edit to a node must not drop them — the wholesale
 * outcome replacement on Confirm would otherwise lose every attached transcript.
 * The proposed description is otherwise left exactly as the agent wrote it.
 */
export function preserveConversationArtifacts(
  liveDescription: string,
  proposedDescription: string
): string {
  if (typeof proposedDescription !== 'string') return proposedDescription
  const liveConvos = (parseFields(liveDescription).artifacts || []).filter(
    isConversationArtifact
  )
  if (!liveConvos.length) return proposedDescription
  const fields = parseFields(proposedDescription)
  // The agent never saw conversation artifacts, so any in its proposal are
  // spurious — drop them before re-adding the live ones so none duplicate.
  const nonConvo = (fields.artifacts || []).filter((a) => !isConversationArtifact(a))
  return serializeFields({ ...fields, artifacts: [...nonConvo, ...liveConvos] })
}

/** Strip conversation artifacts from every node in a snapshot (structurally
 * shared when nothing changed, so the result diffs cleanly against a prior one). */
function stripConversations(snapshot: ProjectSnapshot): ProjectSnapshot {
  const outcomes = (snapshot.outcomes || {}) as Record<string, any>
  let changed = false
  const next: Record<string, any> = {}
  for (const hash of Object.keys(outcomes)) {
    const outcome = outcomes[hash]
    const stripped = stripConversationArtifacts(outcome.description)
    if (stripped !== outcome.description) {
      changed = true
      next[hash] = { ...outcome, description: stripped }
    } else {
      next[hash] = outcome
    }
  }
  return changed ? { ...snapshot, outcomes: next } : snapshot
}

/**
 * Read the current tree for `projectId` as a ProjectSnapshot.
 *
 * Returns the diffable collections (outcomes, connections, tags, …) plus the
 * project meta — exactly `collectExportProjectData`'s output. A snapshot for an
 * unknown project is well-formed with empty collections (never throws), matching
 * the exporter's `|| {}` defaults.
 *
 * v1 hands back the raw hash-keyed snapshot. A future LLM-friendly view (a
 * flattened parent→child tree) can wrap this without changing call sites.
 *
 * Captured conversation artifacts are stripped by default (they carry whole
 * transcripts and bloat every read); pass `includeConversations` to keep them,
 * e.g. when the agent explicitly wants to read a branch's conversation history.
 */
export interface ReadTreeOptions {
  includeConversations?: boolean
}

export function readTree(
  state: RootState,
  projectId: CellIdString,
  opts: ReadTreeOptions = {}
): ProjectSnapshot {
  const snapshot = collectExportProjectData(state, projectId) as ProjectSnapshot
  return opts.includeConversations ? snapshot : stripConversations(snapshot)
}

/** A node the human has selected in the tree, for grounding chat references. */
export interface SelectedNode {
  /** stable action hash — the key into the tree snapshot's `outcomes` */
  actionHash: ActionHashB64
  /** the 6-digit id shown in the UI sidebar (hashCodeId of the action hash) */
  id: string
  /** the node's outcome text */
  content: string
}

/**
 * The nodes currently selected in the tree. Lets the human say "this node" /
 * "these" in chat and have the harness resolve it — the selection is dynamic, so
 * callers should read it per turn rather than once at session start.
 */
export function readSelection(
  state: RootState,
  projectId: CellIdString
): SelectedNode[] {
  const selected: ActionHashB64[] =
    (state.ui && state.ui.selection && state.ui.selection.selectedOutcomes) || []
  const outcomes = state.projects.outcomes[projectId] || {}
  return selected.map((actionHash) => ({
    actionHash,
    id: hashCodeId(actionHash),
    content: (outcomes[actionHash] && outcomes[actionHash].content) || '',
  }))
}
