/**
 * baselineRebase — pure machinery for the baseline-rebase leaf of the
 * concurrent-sessions branch: stamp every read_tree with the identity of the
 * snapshot the agent saw, and rebase a proposed ProjectDiff against the live
 * tree when the two have diverged, surfacing same-field collisions as explicit
 * conflicts instead of silently overwriting the human's live edit.
 *
 * DECIDED 2026-07-28: baseline identity is a SNAPSHOT HASH over a canonical
 * stable-stringify, not a monotonic counter — content-derived identity cannot
 * miss a mutation path, and hashes computed in different windows over converged
 * state agree by construction. The renderer retains the baseline snapshot
 * (keyed by its hash) because the field-level three-way merge needs the
 * content; the hash is the drift comparator, the propose_edits wire token, and
 * the audit label. Determinism is fail-safe: a spurious hash MISMATCH only
 * triggers a rebase that finds nothing to change; a false MATCH cannot occur
 * because the hash covers the actual serialized bytes.
 */
import { ProjectDiff, normalizeDiff } from '../migrating/projectDiff'

// ---------------------------------------------------------------------------
// canonical serialization + hash
// ---------------------------------------------------------------------------

/**
 * JSON.stringify with recursively sorted object keys, so two structurally
 * equal values serialize to identical bytes regardless of key insertion order.
 * `undefined` object values are dropped (matching JSON.stringify), so
 * {handle: undefined} and {} are identical — the same equivalence the rest of
 * the diff layer uses. Arrays keep their order: it is semantic (tasks, criteria).
 */
export function stableStringify(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value))
    return `[${value
      .map((v) => (v === undefined ? 'null' : stableStringify(v)))
      .join(',')}]`
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort()
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`
}

// cyrb-style 53-bit string hash, run twice with independent seeds for a
// 106-bit identity — synchronous (crypto.subtle is async and absent in jsdom)
// and dependency-free. Collision odds across the handful of live baselines a
// session ever holds are negligible.
function cyrb53(str: string, seed: number): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/**
 * The baseline id of a snapshot: hash of its canonical serialization.
 * Snapshots are hashed over their DIFFABLE content only — the collections
 * computeProjectDiff compares — so decoration like nodeRefs never perturbs
 * identity.
 */
export function hashSnapshot(snapshot: any): string {
  const s = snapshot || {}
  const canonical = stableStringify({
    outcomes: s.outcomes ?? {},
    connections: s.connections ?? {},
    tags: s.tags ?? {},
    outcomeMembers: s.outcomeMembers ?? {},
    outcomeComments: s.outcomeComments ?? {},
    entryPoints: s.entryPoints ?? {},
  })
  return (
    cyrb53(canonical, 0x9e3779b9).toString(36) +
    cyrb53(canonical, 0x85ebca6b).toString(36)
  )
}

// ---------------------------------------------------------------------------
// baseline store — the renderer-held snapshots the ids name
// ---------------------------------------------------------------------------

// The fields of an Outcome a person or agent authors — the ones the three-way
// merge reasons about. Bookkeeping (editorAgentPubKey, timestamps) is excluded:
// it changes on every commit and would read as a perpetual conflict.
const MERGE_FIELDS = ['content', 'description', 'scope', 'tags', 'githubLink'] as const
type MergeField = (typeof MERGE_FIELDS)[number]

const MAX_BASELINES = 16

/**
 * Renderer-held baselines keyed by hash. The agent passes back only the id and
 * we look up the snapshot we actually served — so a proposal can never smuggle
 * a fabricated baseline that makes an overwrite look conflict-free. LRU-capped;
 * per-session "latest served" lets propose_edits find its baseline even when
 * the agent doesn't echo the id.
 */
export class BaselineStore {
  private byId = new Map<string, any>()
  private bySession = new Map<string, string>()

  /** Record a served snapshot; returns its baseline id. */
  record(snapshot: any, sessionId?: string | null): string {
    const id = hashSnapshot(snapshot)
    // refresh LRU position
    this.byId.delete(id)
    this.byId.set(id, snapshot)
    while (this.byId.size > MAX_BASELINES) {
      const oldest = this.byId.keys().next().value
      this.byId.delete(oldest)
    }
    if (sessionId) this.bySession.set(sessionId, id)
    return id
  }

  get(id: string): any | undefined {
    return this.byId.get(id)
  }

  /** The most recent baseline served to a session (its read_tree result). */
  latestForSession(sessionId?: string | null): string | undefined {
    return sessionId ? this.bySession.get(sessionId) : undefined
  }

  clear(): void {
    this.byId.clear()
    this.bySession.clear()
  }
}

// the app-wide instance read_tree/propose_edits share (tests construct their own)
export const baselines = new BaselineStore()

// ---------------------------------------------------------------------------
// three-way rebase
// ---------------------------------------------------------------------------

export interface RebaseConflict {
  hash: string
  field: MergeField | 'node'
  kind: 'same-field' | 'removed-but-edited' | 'updated-but-deleted'
  base: any
  live: any
  proposed: any
}

export interface RebaseResult {
  diff: ProjectDiff
  conflicts: RebaseConflict[]
  // count of fields where the human's live edit was carried into the proposal
  // (agent left them at baseline; without the rebase Confirm would revert them)
  rebasedFields: number
}

const eq = (a: any, b: any): boolean => stableStringify(a) === stableStringify(b)

/**
 * Rebase a proposed diff computed against `baseline` onto the `live` tree.
 * Per updated node, per authored field, the classic three-way outcomes:
 *
 *   agent changed, human didn't   → keep the agent's value
 *   human changed, agent didn't   → take the live value (the rebase — without
 *                                   it Confirm reverts the human's edit to the
 *                                   agent's stale baseline copy)
 *   both changed identically      → keep it, no conflict
 *   both changed differently      → CONFLICT: the live value wins by default
 *                                   and the collision is reported
 *
 * A node the agent updated but the human deleted, and a node the agent removed
 * but the human edited, both become conflicts with the live state winning (the
 * update / removal is dropped from the rebased diff).
 *
 * Adds are untouched: they key on synthetic draft hashes and cannot collide
 * with live nodes. Non-outcome collections pass through unchanged — nodes are
 * where concurrent field edits actually collide.
 */
export function rebaseDiff(
  baseline: any,
  live: any,
  diff: ProjectDiff
): RebaseResult {
  const norm = normalizeDiff(diff)
  const baseOutcomes = (baseline && baseline.outcomes) || {}
  const liveOutcomes = (live && live.outcomes) || {}
  const conflicts: RebaseConflict[] = []
  let rebasedFields = 0

  const updated: { [h: string]: any } = {}
  for (const hash of Object.keys(norm.outcomes.updated)) {
    const proposed = norm.outcomes.updated[hash]
    const base = baseOutcomes[hash]
    const liveNode = liveOutcomes[hash]
    if (!base) {
      // node unknown to the baseline (e.g. created after the read) — nothing to
      // merge against; pass through untouched
      updated[hash] = proposed
      continue
    }
    if (!liveNode) {
      // human deleted it since the read — the deletion wins; drop the update
      conflicts.push({
        hash,
        field: 'node',
        kind: 'updated-but-deleted',
        base,
        live: null,
        proposed,
      })
      continue
    }
    const merged = { ...proposed }
    for (const field of MERGE_FIELDS) {
      const agentChanged = field in proposed && !eq(proposed[field], base[field])
      const humanChanged = !eq(liveNode[field], base[field])
      if (!humanChanged) continue // agent's value (changed or not) stands
      if (!agentChanged) {
        // human moved a field the agent left alone — carry the live value
        merged[field] = liveNode[field]
        rebasedFields++
      } else if (!eq(proposed[field], liveNode[field])) {
        // both moved it, differently — conflict; live wins by default
        conflicts.push({
          hash,
          field,
          kind: 'same-field',
          base: base[field],
          live: liveNode[field],
          proposed: proposed[field],
        })
        merged[field] = liveNode[field]
      }
      // both changed to the same value: nothing to do
    }
    updated[hash] = merged
  }

  const removed: string[] = []
  for (const hash of norm.outcomes.removed) {
    const base = baseOutcomes[hash]
    const liveNode = liveOutcomes[hash]
    if (!liveNode) continue // already gone — removal is a no-op; drop it
    if (base && !eq(pickMergeFields(liveNode), pickMergeFields(base))) {
      // human edited the node the agent wants to delete — keep it (live wins)
      conflicts.push({
        hash,
        field: 'node',
        kind: 'removed-but-edited',
        base,
        live: liveNode,
        proposed: null,
      })
      continue
    }
    removed.push(hash)
  }

  return {
    diff: {
      ...norm,
      outcomes: { ...norm.outcomes, updated, removed },
    },
    conflicts,
    rebasedFields,
  }
}

function pickMergeFields(node: any): any {
  const out: any = {}
  for (const f of MERGE_FIELDS) out[f] = node[f]
  return out
}

/** One-line human summary of a rebase, for the propose_edits result / nudges. */
export function describeRebase(r: RebaseResult): string {
  const parts: string[] = []
  if (r.rebasedFields)
    parts.push(
      `${r.rebasedFields} field(s) rebased onto the human's live edits`
    )
  if (r.conflicts.length)
    parts.push(
      `${r.conflicts.length} conflict(s) — the live version was kept; the human can override in review`
    )
  return parts.length ? parts.join('; ') : 'clean — no divergence from baseline'
}
