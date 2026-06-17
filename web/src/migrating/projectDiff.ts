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

/**
 * Coerce a possibly-partial diff (e.g. one an LLM proposed with only the
 * collections it touched, or a delta missing `removed`) into a full ProjectDiff
 * with every collection present and every `{added,updated,removed}` field set.
 * Pure; safe on null/garbage input. Callers that store or iterate a diff should
 * normalize first so downstream code can assume the complete shape.
 */
export function normalizeDiff(partial: any): ProjectDiff {
  const out = {} as ProjectDiff
  for (const c of DIFF_COLLECTIONS) {
    const d = (partial && partial[c]) || {}
    out[c] = {
      added: d.added && typeof d.added === 'object' ? d.added : {},
      updated: d.updated && typeof d.updated === 'object' ? d.updated : {},
      removed: Array.isArray(d.removed) ? d.removed : [],
    }
  }
  return out
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
 * References in a diff that resolve to no outcome — neither present in the base
 * snapshot (minus what the diff removes) nor newly added by the diff. These are the
 * "unresolved references" that would otherwise produce a dangling/failed apply, so
 * the caller can report them and refuse instead.
 */
export function findUnresolvedReferences(
  diff: ProjectDiff,
  base: ProjectSnapshot
): ActionHash[] {
  const removed = new Set(diff.outcomes.removed)
  const known = new Set<ActionHash>([
    ...Object.keys(base.outcomes ?? {}).filter((h) => !removed.has(h)),
    ...Object.keys(diff.outcomes.added),
  ])
  const missing = new Set<ActionHash>()
  const check = (hash?: ActionHash) => {
    if (hash && !known.has(hash)) missing.add(hash)
  }
  for (const conn of [
    ...Object.values(diff.connections.added),
    ...Object.values(diff.connections.updated),
  ]) {
    check(conn?.parentActionHash)
    check(conn?.childActionHash)
  }
  for (const collection of ['outcomeMembers', 'outcomeComments', 'entryPoints'] as const) {
    for (const entry of [
      ...Object.values(diff[collection].added),
      ...Object.values(diff[collection].updated),
    ]) {
      check(entry?.outcomeActionHash)
    }
  }
  return [...missing]
}

/**
 * Per-node change counts for a diff (i3b) — what the diff did TO each outcome,
 * rendered as +/~/− badges on the changed nodes themselves. Counts are item-level
 * within the node: clarity fields (description JSON keys), checklist tasks, the
 * statement, scope, and tags. A brand-new node is flagged isNew instead of counted.
 * Node deletions can't badge the deleted node, so they count as removals on its
 * parent(s), resolved from the base snapshot's connections.
 *
 * Keys are the diff's (pre-apply) hashes — the live applier remaps updated nodes
 * to their post-apply hashes.
 */
export interface OutcomeChangeStats {
  isNew: boolean
  added: number
  updated: number
  removed: number
}
export type OutcomeChangeStatsMap = { [hash: string]: OutcomeChangeStats }

// description holds the node's clarity fields as a JSON object string
function parseClarityFields(description: unknown): { [k: string]: any } | null {
  if (typeof description !== 'string') return null
  try {
    const parsed = JSON.parse(description)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}

export function perOutcomeChangeStats(
  diff: ProjectDiff,
  base: ProjectSnapshot
): OutcomeChangeStatsMap {
  const stats: OutcomeChangeStatsMap = {}
  const get = (hash: ActionHash): OutcomeChangeStats => {
    if (!stats[hash]) stats[hash] = { isNew: false, added: 0, updated: 0, removed: 0 }
    return stats[hash]
  }
  const baseOutcomes = base.outcomes ?? {}
  const baseConnections = base.connections ?? {}
  const removedSet = new Set(diff.outcomes.removed)

  for (const hash of Object.keys(diff.outcomes.added)) get(hash).isNew = true

  for (const hash of Object.keys(diff.outcomes.updated)) {
    const prev = baseOutcomes[hash]
    const next = diff.outcomes.updated[hash]
    const s = get(hash)
    if (!prev) {
      s.updated++
      continue
    }
    if (prev.content !== next.content) s.updated++
    if (!equal(prev.tags, next.tags)) s.updated++
    // scope minus the taskList (achievement status, target date, Small/Uncertain)
    const scopeSansTasks = (entry: any) => {
      const small = entry?.scope?.Small
      if (!small) return entry?.scope
      const { taskList, ...rest } = small
      return { Small: rest }
    }
    if (!equal(scopeSansTasks(prev), scopeSansTasks(next))) s.updated++
    // checklist tasks, matched by their text (they carry no ids)
    const prevTasks: any[] = prev?.scope?.Small?.taskList ?? []
    const nextTasks: any[] = next?.scope?.Small?.taskList ?? []
    const prevByText = new Map(prevTasks.map((t) => [t.task, t]))
    const nextByText = new Map(nextTasks.map((t) => [t.task, t]))
    for (const [text, task] of nextByText) {
      if (!prevByText.has(text)) s.added++
      else if (!equal(prevByText.get(text), task)) s.updated++
    }
    for (const text of prevByText.keys()) {
      if (!nextByText.has(text)) s.removed++
    }
    // clarity fields: per-key add/edit/remove; opaque change if unparseable
    const prevFields = parseClarityFields(prev.description)
    const nextFields = parseClarityFields(next.description)
    if (prevFields && nextFields) {
      for (const key of Object.keys(nextFields)) {
        if (!(key in prevFields)) s.added++
        else if (!equal(prevFields[key], nextFields[key])) s.updated++
      }
      for (const key of Object.keys(prevFields)) {
        if (!(key in nextFields)) s.removed++
      }
    } else if (!equal(prev.description, next.description)) {
      s.updated++
    }
    // the entries differ somewhere we don't itemize (timestamps aside) — still
    // show the node as edited rather than badging nothing
    if (!s.added && !s.updated && !s.removed && !equal(prev, next)) s.updated++
  }

  // a deleted node shows as a removal on its surviving parent(s)
  for (const hash of diff.outcomes.removed) {
    for (const conn of Object.values(baseConnections)) {
      if (
        conn?.childActionHash === hash &&
        conn?.parentActionHash &&
        !removedSet.has(conn.parentActionHash)
      ) {
        get(conn.parentActionHash).removed++
      }
    }
  }

  // connection changes: a new child counts as an addition on its parent; a
  // relink counts as an edit on both surviving endpoints
  const connChanges = {
    ...diff.connections.added,
    ...diff.connections.updated,
  }
  for (const conn of Object.values(connChanges)) {
    const parent = conn?.parentActionHash
    const child = conn?.childActionHash
    if (parent && !removedSet.has(parent)) {
      if (child && diff.outcomes.added[child]) get(parent).added++
      else get(parent).updated++
    }
    if (child && !removedSet.has(child) && !diff.outcomes.added[child]) {
      get(child).updated++
    }
  }
  for (const connHash of diff.connections.removed) {
    const conn = baseConnections[connHash]
    if (!conn) continue
    // a connection removed because its child was deleted is already counted above
    if (conn.childActionHash && removedSet.has(conn.childActionHash)) continue
    if (conn.parentActionHash && !removedSet.has(conn.parentActionHash)) {
      get(conn.parentActionHash).removed++
    }
    if (conn.childActionHash) get(conn.childActionHash).updated++
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
