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
  findUnresolvedReferences,
  normalizeDiff,
  OutcomeChangeStatsMap,
} from '../../migrating/projectDiff'
import { applyProjectDiffToCell } from '../../migrating/applyProjectDiff'
import { readTree } from '../../harness/readTree'
import {
  activeEffectiveDiff,
  isEmptyEffective,
} from '../../redux/ephemeral/draft/changes'
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

// A scope an added node can default to when the proposal omits one — a valid
// (empty, unachieved) Small scope, so the Outcome entry passes the zome's schema.
const DEFAULT_SCOPE = {
  Small: { achievementStatus: 'NotAchieved', targetDate: null, taskList: [] },
}

// Fill an outcome entry out to the full Outcome the zome requires (clarity-tree
// draft pipeline). An LLM proposes minimal entries (often just content / scope /
// description), but the integrity zome demands every field — creatorAgentPubKey,
// timestamps, isImported, githubLink, editorAgentPubKey. For an UPDATE we layer
// the proposal over the committed outcome so its required fields survive; for an
// ADD we supply sane defaults. Without this, applyProjectDiffToCell sends a
// partial entry the zome can't deserialize (the Confirm crash).
function completeOutcome(entry: any, me: string, now: number, base: any | null) {
  const e = entry || {}
  const b = base || {}
  return {
    ...e,
    content: e.content ?? b.content ?? '',
    creatorAgentPubKey: e.creatorAgentPubKey ?? b.creatorAgentPubKey ?? me,
    editorAgentPubKey: me,
    timestampCreated: e.timestampCreated ?? b.timestampCreated ?? now,
    timestampUpdated: now,
    scope: e.scope ?? b.scope ?? DEFAULT_SCOPE,
    tags: e.tags ?? b.tags ?? [],
    description: e.description ?? b.description ?? '',
    isImported: e.isImported ?? b.isImported ?? false,
    githubLink: e.githubLink ?? b.githubLink ?? '',
  }
}

// Complete every proposed outcome entry in a diff against the live tree + the
// committing agent, so the draft holds full entries (overlay renders, the diff
// view compares cleanly, and Confirm commits a zome-valid payload).
function completeProposedDiff(
  store: Store,
  projectId: CellIdString,
  diff: ProjectDiff
): ProjectDiff {
  const state = store.getState() as RootState
  const live = state.projects.outcomes[projectId] || {}
  const me = (state as any).agentAddress || ''
  // Date.now is unavailable in some sandboxes but fine in the renderer
  const now = Date.now()
  const norm = normalizeDiff(diff)
  const added: { [h: string]: any } = {}
  for (const h of Object.keys(norm.outcomes.added))
    added[h] = completeOutcome(norm.outcomes.added[h], me, now, null)
  const updated: { [h: string]: any } = {}
  for (const h of Object.keys(norm.outcomes.updated))
    updated[h] = completeOutcome(norm.outcomes.updated[h], me, now, live[h])
  return { ...norm, outcomes: { ...norm.outcomes, added, updated } }
}

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

// Open a brand-new draft for review and light it up. The proposed outcomes are
// completed against the live tree first, so the draft is committable.
export function enterDraftReview(
  store: Store,
  diff: ProjectDiff,
  projectId: CellIdString
): void {
  store.dispatch(openDraft(completeProposedDiff(store, projectId, diff), projectId))
  refreshDraftGlow(store, projectId)
}

// Replace the proposed diff of an already-open draft (e.g. the agent revised it)
// and re-light.
export function updateDraftReview(
  store: Store,
  diff: ProjectDiff,
  projectId: CellIdString
): void {
  store.dispatch(updateDraft(completeProposedDiff(store, projectId, diff)))
  refreshDraftGlow(store, projectId)
}

// Leave draft mode without committing — clears the draft and the glow. No DHT
// writes (Discard, L4).
export function exitDraftReview(store: Store): void {
  store.dispatch(clearDraft())
  store.dispatch(unselectAll())
}

export type ConfirmResult =
  | { ok: true; committed: number; empty?: boolean }
  | { ok: false; error: string }

/**
 * Confirm a draft (L4): commit the ACCEPTED + EDITED subset to the DHT in one go,
 * then clear the draft and light the committed nodes via the normal post-apply
 * path (the AgentDiffTools sequence). This is the ONLY draft path that writes to
 * the DHT — it runs applyProjectDiffToCell over the effective diff. A draft with
 * everything rejected commits nothing and just exits.
 *
 * Refuses (without writing) if the effective diff has unresolved references,
 * mirroring AgentDiffTools.
 */
export async function confirmDraft(
  store: Store,
  projectId: CellIdString
): Promise<ConfirmResult> {
  const state = store.getState() as RootState
  const draftDiff: ProjectDiff | null = activeEffectiveDiff(
    state.ui.draft,
    projectId
  )
  if (!draftDiff) return { ok: false, error: 'No draft open.' }
  if (isEmptyEffective(draftDiff)) {
    // nothing accepted — discard semantics, no DHT write
    exitDraftReview(store)
    return { ok: true, committed: 0, empty: true }
  }
  const base = readTree(state, projectId)
  const unresolved = findUnresolvedReferences(draftDiff, base)
  if (unresolved.length) {
    return {
      ok: false,
      error: `Cannot commit — ${unresolved.length} reference(s) point to missing nodes.`,
    }
  }
  // per-node stats against the pre-commit tree (keyed by diff hashes; remapped to
  // live post-apply hashes below)
  const stats: OutcomeChangeStatsMap = perOutcomeChangeStats(draftDiff, base)
  const result = await applyProjectDiffToCell(draftDiff, projectId, store.dispatch)
  // the live nodes now exist in projects.* — drop the draft so the overlay stops
  // rendering the synthetic draft:* nodes and the real ones show through
  store.dispatch(clearDraft())
  // remap stats keys (pre-apply diff hashes) onto the live post-apply hashes
  const liveStats: OutcomeChangeStatsMap = {}
  for (const hash of Object.keys(stats)) {
    liveStats[result.outcomeHashMap[hash] ?? hash] = stats[hash]
  }
  const touched = [
    ...new Set([...result.touchedOutcomes, ...Object.keys(liveStats)]),
  ]
  store.dispatch(unselectAll())
  store.dispatch(setChangedOutcomes(touched, liveStats))
  setTimeout(() => fitToChanged(store, touched), 800)
  return { ok: true, committed: touched.length }
}
