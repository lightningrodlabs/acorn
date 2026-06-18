/**
 * nodeRef — resolve a stable, human-usable reference to a clarity-tree node.
 *
 * A node has several stable referents, all resolving to one canonical identity —
 * the content-addressed `actionHash` (stable by construction):
 *   • actionHash  — the canonical content-addressed identity (a map key)
 *   • hashCodeId  — its 6-digit short rendering (clientSideIdHash)
 *   • handle      — an optional author-assigned slug ([a-z0-9-]), memorable + stable
 *
 * On top of those, a CASUAL relative path names a node by an ancestor plus
 * left-to-right child positions — `<ancestor-ref>/<index>[/<index>...]`. The path
 * form is convenient for in-the-moment conversation but is EPHEMERAL: it breaks when
 * the tree is rearranged, so it is never stored as a node's identity (see
 * clarity-engine/node-references.md). Identity that survives rearrangement is
 * content-addressed (actionHash / hashCodeId) or author-assigned (handle).
 *
 * Pure (no Redux, no Holochain): it operates on a ProjectSnapshot, so it is
 * unit-testable and reused by read_tree, propose_edits, and chat-reference plumbing.
 */
import hashCodeId from './api/clientSideIdHash'
import { getHandle } from './outcomeFields'
import { ProjectSnapshot, ProjectDiff, EntityMap } from './migrating/projectDiff'

export interface NodeRef {
  /** canonical content-addressed identity */
  actionHash: string
  /** 6-digit short rendering of the actionHash */
  hashCodeId: string
  /** author-assigned slug, when the node has one */
  handle?: string
}

type Outcomes = { [actionHash: string]: any }
type Connections = { [actionHash: string]: any }

function outcomesOf(project: ProjectSnapshot | any): Outcomes {
  return (project && project.outcomes) || {}
}
function connectionsOf(project: ProjectSnapshot | any): Connections {
  return (project && project.connections) || {}
}

/** The handle on one outcome entry (parsed from its description), or undefined. */
function handleOfOutcome(outcome: any): string | undefined {
  if (!outcome) return undefined
  const desc = typeof outcome.description === 'string' ? outcome.description : ''
  return getHandle(desc)
}

/**
 * Per-node stable reference triples {actionHash, hashCodeId, handle?}, keyed by
 * actionHash. read_tree returns this alongside the snapshot so an agent can name a
 * node by whichever referent is convenient. Separate from the outcome entries, so
 * the canonical snapshot (used for diffing) is never polluted.
 */
export function buildNodeRefs(project: ProjectSnapshot | any): {
  [actionHash: string]: NodeRef
} {
  const refs: { [actionHash: string]: NodeRef } = {}
  for (const [hash, outcome] of Object.entries(outcomesOf(project))) {
    refs[hash] = {
      actionHash: hash,
      hashCodeId: hashCodeId(hash),
      handle: handleOfOutcome(outcome),
    }
  }
  return refs
}

/**
 * The label to show for a node: its handle when it has one, else its 6-digit
 * hashCodeId. So there is always a stable, human-readable id on screen, and
 * assigning a handle visibly replaces the opaque id. Pure read — no new data.
 */
export function nodeDisplayLabel(node: {
  actionHash: string
  description?: string
}): string {
  const handle = node.description ? getHandle(node.description) : undefined
  return handle ?? hashCodeId(node.actionHash)
}

/** Map of handle -> actionHash for every node carrying a handle (first wins). */
export function collectHandleMap(project: ProjectSnapshot | any): Map<string, string> {
  const map = new Map<string, string>()
  for (const [hash, outcome] of Object.entries(outcomesOf(project))) {
    const handle = handleOfOutcome(outcome)
    if (handle && !map.has(handle)) map.set(handle, hash)
  }
  return map
}

/**
 * The actionHash of a node that already owns `handle` (other than `exceptActionHash`),
 * or undefined when the handle is free. Drives per-project uniqueness on assignment:
 * a non-undefined result means assigning `handle` would collide.
 */
export function handleConflict(
  project: ProjectSnapshot | any,
  handle: string | undefined,
  exceptActionHash?: string
): string | undefined {
  if (!handle) return undefined
  const owner = collectHandleMap(project).get(handle)
  return owner && owner !== exceptActionHash ? owner : undefined
}

/** Whether `handle` is available to assign to `exceptActionHash` in this project. */
export function isHandleAvailable(
  project: ProjectSnapshot | any,
  handle: string | undefined,
  exceptActionHash?: string
): boolean {
  return handleConflict(project, handle, exceptActionHash) === undefined
}

/** Resolve a single (non-path) ref: actionHash, then handle, then hashCodeId. */
function resolveSingle(project: ProjectSnapshot | any, ref: string): string | null {
  const outcomes = outcomesOf(project)
  // 1. exact actionHash (canonical identity)
  if (ref in outcomes) return ref
  // 2. author-assigned handle
  const byHandle = collectHandleMap(project).get(ref)
  if (byHandle) return byHandle
  // 3. 6-digit hashCodeId short form
  for (const hash of Object.keys(outcomes)) {
    if (hashCodeId(hash) === ref) return hash
  }
  return null
}

/**
 * Children of `parentHash`, left-to-right. Sibling order renders leftmost for the
 * HIGHER siblingOrder, so left-to-right index 0 is the highest siblingOrder (matches
 * the clarity-tree convention: leftmost = most foundational / first).
 */
export function childrenLeftToRight(
  project: ProjectSnapshot | any,
  parentHash: string
): string[] {
  const conns = Object.values(connectionsOf(project)).filter(
    (c: any) => c && c.parentActionHash === parentHash
  )
  conns.sort((a: any, b: any) => (b.siblingOrder ?? 0) - (a.siblingOrder ?? 0))
  return conns.map((c: any) => c.childActionHash)
}

/** Resolve a casual relative path `<ancestor-ref>/<index>[/<index>...]`. */
function resolvePath(project: ProjectSnapshot | any, ref: string): string | null {
  const parts = ref
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  if (parts.length === 0) return null
  let current = resolveSingle(project, parts[0])
  if (!current) return null
  for (let i = 1; i < parts.length; i++) {
    const idx = Number(parts[i])
    if (!Number.isInteger(idx) || idx < 0) return null
    const kids = childrenLeftToRight(project, current)
    if (idx >= kids.length) return null
    current = kids[idx]
  }
  return current
}

/**
 * Resolve any stable referent of a node to its actionHash, or null if unresolved.
 * Accepts {actionHash, handle, hashCodeId} and the casual `<ancestor>/<index>` path.
 * Unresolved refs return null (reported, never silently mismatched).
 */
export function resolveRef(
  project: ProjectSnapshot | any,
  ref: string | undefined | null
): string | null {
  if (typeof ref !== 'string') return null
  const trimmed = ref.trim()
  if (!trimmed) return null
  if (trimmed.includes('/')) return resolvePath(project, trimmed)
  return resolveSingle(project, trimmed)
}

/**
 * Route a proposed diff's node references through resolveRef so an agent may target
 * an existing node by handle / hashCodeId / path instead of its raw actionHash.
 *
 * Conservative and non-breaking: a key that is already an existing actionHash, or a
 * node ADDED in this same diff, is left untouched; only a key that is neither yet
 * resolves via resolveRef is remapped to the canonical actionHash. Applies to
 * outcomes.updated / outcomes.removed and to connection parent/child refs. Refs that
 * resolve to nothing are returned in `unresolved` (and left as-is for the caller).
 */
export function remapDiffRefs(
  project: ProjectSnapshot | any,
  diff: ProjectDiff
): { diff: ProjectDiff; unresolved: string[] } {
  const outcomes = outcomesOf(project)
  const addedKeys = new Set(Object.keys(diff.outcomes?.added || {}))
  const unresolved: string[] = []

  // Resolve a ref to an EXISTING node, or a node added in this diff; null otherwise.
  const resolveTarget = (ref: string): string | null => {
    if (ref in outcomes) return ref
    if (addedKeys.has(ref)) return ref
    return resolveRef(project, ref)
  }

  const next: ProjectDiff = JSON.parse(JSON.stringify(diff))

  // outcomes.updated — remap keys, keeping each entry's actionHash in sync
  const remappedUpdated: EntityMap = {}
  for (const [key, value] of Object.entries(next.outcomes.updated)) {
    const target = resolveTarget(key)
    if (!target) {
      unresolved.push(key)
      remappedUpdated[key] = value
    } else {
      remappedUpdated[target] = { ...(value as any), actionHash: target }
    }
  }
  next.outcomes.updated = remappedUpdated

  // outcomes.removed — remap the hashes
  next.outcomes.removed = next.outcomes.removed.map((key) => {
    const target = resolveTarget(key)
    if (!target) {
      unresolved.push(key)
      return key
    }
    return target
  })

  // connections.added — remap parent/child references
  for (const conn of Object.values(next.connections.added) as any[]) {
    if (conn && typeof conn.parentActionHash === 'string') {
      const p = resolveTarget(conn.parentActionHash)
      if (p) conn.parentActionHash = p
      else unresolved.push(conn.parentActionHash)
    }
    if (conn && typeof conn.childActionHash === 'string') {
      const c = resolveTarget(conn.childActionHash)
      if (c) conn.childActionHash = c
      else unresolved.push(conn.childActionHash)
    }
  }

  return { diff: next, unresolved }
}
