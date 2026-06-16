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
 */
export function readTree(
  state: RootState,
  projectId: CellIdString
): ProjectSnapshot {
  return collectExportProjectData(state, projectId) as ProjectSnapshot
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
