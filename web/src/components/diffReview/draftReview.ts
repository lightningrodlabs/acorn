/**
 * draftReview — the side-effecting glue that puts the map into "draft review"
 * mode for an open draft (clarity-tree draft pipeline L2/L3/L4). It reuses the
 * exact branch-I glow + per-node-badge + fit-to-changed path
 * (setChangedOutcomes / perOutcomeChangeStats / fitToChanged) so a proposed diff
 * lights up identically to an applied one — except nothing is written to the DHT.
 *
 * These are imperative store helpers (the app has no thunk middleware), mirroring
 * how AgentDiffTools drives the same sequence after an apply.
 */
import { Store } from 'redux'
import { RootState } from '../../redux/reducer'
import { CellIdString } from '../../types/shared'
import {
  ProjectDiff,
  perOutcomeChangeStats,
  touchedOutcomeHashes,
  OutcomeChangeStatsMap,
} from '../../migrating/projectDiff'
import { readTree } from '../../harness/readTree'
import { activeEffectiveDiff } from '../../redux/ephemeral/draft/changes'
import {
  openDraft,
  updateDraft,
  clearDraft,
} from '../../redux/ephemeral/draft/actions'
import {
  setChangedOutcomes,
  unselectAll,
} from '../../redux/ephemeral/selection/actions'
import { fitToChanged } from './fitToChanged'

// Light the glow + badges for the effective draft of `projectId`. Computes the
// per-node +/~/− stats against the live tree (the base snapshot) so the badges
// read as proposed deltas; fits the view once the layout settles. With no draft
// (or an empty one after rejections) it just clears the glow.
export function refreshDraftGlow(store: Store, projectId: CellIdString): void {
  const state = store.getState() as RootState
  const draftDiff: ProjectDiff | null = activeEffectiveDiff(
    state.ui.draft,
    projectId
  )
  store.dispatch(unselectAll())
  if (!draftDiff) return
  const base = readTree(state, projectId)
  const stats: OutcomeChangeStatsMap = perOutcomeChangeStats(draftDiff, base)
  // touched (added/updated + connection endpoints) PLUS parents of removals,
  // which only appear in stats — mirrors AgentDiffTools' post-apply highlight
  const touched = [
    ...new Set([...touchedOutcomeHashes(draftDiff), ...Object.keys(stats)]),
  ]
  store.dispatch(setChangedOutcomes(touched, stats))
  // fit once the layout animation has positioned the (possibly new) nodes
  setTimeout(() => fitToChanged(store, touched), 800)
}

// Open a brand-new draft for review and light it up.
export function enterDraftReview(
  store: Store,
  diff: ProjectDiff,
  projectId: CellIdString
): void {
  store.dispatch(openDraft(diff, projectId))
  refreshDraftGlow(store, projectId)
}

// Replace the proposed diff of an already-open draft (e.g. the agent revised it)
// and re-light.
export function updateDraftReview(
  store: Store,
  diff: ProjectDiff,
  projectId: CellIdString
): void {
  store.dispatch(updateDraft(diff))
  refreshDraftGlow(store, projectId)
}

// Leave draft mode without committing — clears the draft and the glow. No DHT
// writes (Discard, L4).
export function exitDraftReview(store: Store): void {
  store.dispatch(clearDraft())
  store.dispatch(unselectAll())
}
