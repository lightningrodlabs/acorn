/**
 * projectDiff — compute and apply lightweight diffs between two project snapshots,
 * so an LLM agent loop can exchange just what changed instead of whole trees
 * (clarity-tree branch I).
 *
 * A snapshot is the same shape the exporter already produces (ProjectExportData):
 * each collection (outcomes, connections, tags, …) is a record keyed by actionHash.
 * A diff records, per collection, the entries added / updated / removed.
 *
 * This module is pure (no Holochain, no Redux) so it is fully unit-testable and can
 * run headlessly; the in-app export/import wiring builds on top of it.
 */

export type ActionHash = string
export type EntityMap = { [actionHash: string]: any }

/** The collections a diff covers — the subset of a project export that changes. */
export const DIFF_COLLECTIONS = [
  'outcomes',
  'connections',
  'tags',
  'outcomeMembers',
  'outcomeComments',
  'entryPoints',
] as const
export type DiffCollection = (typeof DIFF_COLLECTIONS)[number]

/** A project-like snapshot: at minimum the diffable collections. */
export type ProjectSnapshot = { [K in DiffCollection]?: EntityMap }

export interface CollectionDelta {
  added: EntityMap
  updated: EntityMap
  removed: ActionHash[]
}
export type ProjectDiff = { [K in DiffCollection]: CollectionDelta }

// Stable-enough deep equality for the plain data we store. Both sides are produced
// by the same serialization paths, so JSON key order is consistent.
function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function emptyDelta(): CollectionDelta {
  return { added: {}, updated: {}, removed: [] }
}

function diffCollection(prev: EntityMap, current: EntityMap): CollectionDelta {
  const delta = emptyDelta()
  for (const hash of Object.keys(current)) {
    if (!(hash in prev)) {
      delta.added[hash] = current[hash]
    } else if (!equal(prev[hash], current[hash])) {
      delta.updated[hash] = current[hash]
    }
  }
  for (const hash of Object.keys(prev)) {
    if (!(hash in current)) delta.removed.push(hash)
  }
  return delta
}

/** Compute the diff that turns `prev` into `current`. */
export function computeProjectDiff(
  prev: ProjectSnapshot,
  current: ProjectSnapshot
): ProjectDiff {
  const diff = {} as ProjectDiff
  for (const collection of DIFF_COLLECTIONS) {
    diff[collection] = diffCollection(prev[collection] ?? {}, current[collection] ?? {})
  }
  return diff
}

/** True when a diff carries no changes at all. */
export function isEmptyDiff(diff: ProjectDiff): boolean {
  return DIFF_COLLECTIONS.every((c) => {
    const d = diff[c]
    return (
      Object.keys(d.added).length === 0 &&
      Object.keys(d.updated).length === 0 &&
      d.removed.length === 0
    )
  })
}

/**
 * Apply a diff onto a base snapshot, returning a new snapshot. Idempotent: applying
 * the same diff twice yields the same result (adds/updates overwrite, removes are a
 * no-op if already gone). Pure — does not mutate `base`.
 */
export function applyProjectDiff(
  base: ProjectSnapshot,
  diff: ProjectDiff
): ProjectSnapshot {
  const result: ProjectSnapshot = {}
  for (const collection of DIFF_COLLECTIONS) {
    const next: EntityMap = { ...(base[collection] ?? {}) }
    const d = diff[collection]
    for (const hash of Object.keys(d.added)) next[hash] = d.added[hash]
    for (const hash of Object.keys(d.updated)) next[hash] = d.updated[hash]
    for (const hash of d.removed) delete next[hash]
    result[collection] = next
  }
  return result
}

/** Per-collection change counts, handy for UI summaries and logging. */
export function diffStats(
  diff: ProjectDiff
): { [K in DiffCollection]: { added: number; updated: number; removed: number } } {
  const stats = {} as ReturnType<typeof diffStats>
  for (const c of DIFF_COLLECTIONS) {
    stats[c] = {
      added: Object.keys(diff[c].added).length,
      updated: Object.keys(diff[c].updated).length,
      removed: diff[c].removed.length,
    }
  }
  return stats
}

/**
 * The set of outcome action-hashes a diff touched — used to "light up" the tree
 * after an import. Includes outcomes added/updated directly, plus the endpoints of
 * any added/updated connections (so a re-parented or newly-linked node lights up
 * too). Removed entries are excluded — there is nothing left to highlight.
 */
export function touchedOutcomeHashes(diff: ProjectDiff): ActionHash[] {
  const touched = new Set<ActionHash>()
  for (const hash of Object.keys(diff.outcomes.added)) touched.add(hash)
  for (const hash of Object.keys(diff.outcomes.updated)) touched.add(hash)
  const connChanges = {
    ...diff.connections.added,
    ...diff.connections.updated,
  }
  for (const hash of Object.keys(connChanges)) {
    const conn = connChanges[hash]
    if (conn?.parentActionHash) touched.add(conn.parentActionHash)
    if (conn?.childActionHash) touched.add(conn.childActionHash)
  }
  return [...touched]
}
