/**
 * Pure helpers over a draft ProjectDiff — change keys, the "effective" diff
 * after per-change accept/reject + inline edits are applied, and the render
 * overlay merge. No Redux, no Holochain, so this is fully unit-testable and is
 * the single source of truth shared by the reducer, the glow side-effects, the
 * render selectors, and the commit path (clarity-tree draft pipeline L3/L4).
 *
 * The load-bearing invariant: a draft is inert. Everything here operates on
 * plain snapshots/diffs; nothing touches the DHT.
 */
import {
  ProjectDiff,
  ProjectSnapshot,
  EntityMap,
  DIFF_COLLECTIONS,
  DiffCollection,
} from '../../../migrating/projectDiff'

export type ChangeOp = 'added' | 'updated' | 'removed'

/**
 * A stable key identifying one change within a draft, so a human's accept/reject
 * decision (and an inline edit) can be addressed independently. Shape:
 * `<collection>:<op>:<hash>` e.g. `outcomes:added:draft:1`, `connections:updated:uhC…`.
 */
export function changeKey(
  collection: DiffCollection,
  op: ChangeOp,
  hash: string
): string {
  return `${collection}:${op}:${hash}`
}

export type DecisionMap = { [key: string]: boolean }

// A change is accepted unless a decision explicitly rejects it (default-accept).
export function isAccepted(decisions: DecisionMap, key: string): boolean {
  return decisions[key] !== false
}

function emptyDelta() {
  return { added: {} as EntityMap, updated: {} as EntityMap, removed: [] as string[] }
}

/**
 * The diff that actually survives review: every change the human rejected is
 * dropped. A rejected `added`/`updated` entry is excluded; a rejected `removed`
 * hash is kept in the tree (i.e. removed from the removal list). Inline edits are
 * already baked into `diff` (they mutate the entry in place via updateDraftEntry),
 * so this only has to filter by decision.
 */
export function effectiveDiff(
  diff: ProjectDiff,
  decisions: DecisionMap
): ProjectDiff {
  const result = {} as ProjectDiff
  for (const collection of DIFF_COLLECTIONS) {
    const src = diff[collection]
    const out = emptyDelta()
    for (const hash of Object.keys(src.added)) {
      if (isAccepted(decisions, changeKey(collection, 'added', hash)))
        out.added[hash] = src.added[hash]
    }
    for (const hash of Object.keys(src.updated)) {
      if (isAccepted(decisions, changeKey(collection, 'updated', hash)))
        out.updated[hash] = src.updated[hash]
    }
    for (const hash of src.removed) {
      if (isAccepted(decisions, changeKey(collection, 'removed', hash)))
        out.removed.push(hash)
    }
    result[collection] = out
  }
  return result
}

/**
 * Merge a (already effective) diff's added/updated outcomes & connections over a
 * base snapshot's collections, FOR RENDERING ONLY. Removed entries are left in
 * place — a removed node is not yet deleted, its removal surfaces as a `−` badge
 * on the surviving parent (perOutcomeChangeStats). The base collections are never
 * mutated, so "the draft never persists" holds by construction.
 */
export function overlayCollection(
  base: EntityMap,
  delta: { added: EntityMap; updated: EntityMap }
): EntityMap {
  return { ...base, ...delta.added, ...delta.updated }
}

/**
 * The active draft's diff with decisions applied, or null when no draft is open
 * for the given project. The overlay/glow paths key off this so a draft scoped to
 * one project never bleeds into another.
 */
export function activeEffectiveDiff(
  draft: { diff: ProjectDiff | null; decisions: DecisionMap; projectId: string | null },
  activeProject: string
): ProjectDiff | null {
  if (!draft.diff || draft.projectId !== activeProject) return null
  return effectiveDiff(draft.diff, draft.decisions)
}

/**
 * Merge a draft (already effective) over a project's persisted outcomes &
 * connections, for rendering only. Returns the inputs unchanged when there is no
 * draft, so callers can wire it in unconditionally.
 */
export function overlayProject(
  outcomes: EntityMap,
  connections: EntityMap,
  diff: ProjectDiff | null
): { outcomes: EntityMap; connections: EntityMap } {
  if (!diff) return { outcomes, connections }
  return {
    outcomes: overlayCollection(outcomes, diff.outcomes),
    connections: overlayCollection(connections, diff.connections),
  }
}

/** True when the diff carries no surviving change (after decisions applied). */
export function isEmptyEffective(diff: ProjectDiff): boolean {
  return DIFF_COLLECTIONS.every((c) => {
    const d = diff[c]
    return (
      Object.keys(d.added).length === 0 &&
      Object.keys(d.updated).length === 0 &&
      d.removed.length === 0
    )
  })
}

export { DIFF_COLLECTIONS }
export type { ProjectDiff, ProjectSnapshot }
