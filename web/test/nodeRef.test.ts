import hashCodeId from '../src/api/clientSideIdHash'
import { serializeFields, setHandle } from '../src/outcomeFields'
import {
  resolveRef,
  buildNodeRefs,
  collectHandleMap,
  handleConflict,
  isHandleAvailable,
  childrenLeftToRight,
  nodeDisplayLabel,
  remapDiffRefs,
} from '../src/nodeRef'
import { ProjectDiff } from '../src/migrating/projectDiff'

// A small live tree:
//   root  (handle: root-node)
//   ├─ childA  (siblingOrder 2, leftmost)   handle: alpha
//   ├─ childB  (siblingOrder 1)
//   └─ childC  (siblingOrder 0, rightmost)
// Descriptions carry the OutcomeFields JSON (handle included).
const withHandle = (outcome: string, handle?: string) =>
  handle
    ? setHandle(serializeFields({ outcome }), handle)
    : serializeFields({ outcome })

const ROOT = 'uhCkkROOT'
const A = 'uhCkkAAA'
const B = 'uhCkkBBB'
const C = 'uhCkkCCC'

const project: any = {
  outcomes: {
    [ROOT]: { actionHash: ROOT, content: 'root', description: withHandle('root', 'root-node') },
    [A]: { actionHash: A, content: 'a', description: withHandle('a', 'alpha') },
    [B]: { actionHash: B, content: 'b', description: withHandle('b') },
    [C]: { actionHash: C, content: 'c', description: withHandle('c') },
  },
  connections: {
    c1: { actionHash: 'c1', parentActionHash: ROOT, childActionHash: A, siblingOrder: 2 },
    c2: { actionHash: 'c2', parentActionHash: ROOT, childActionHash: B, siblingOrder: 1 },
    c3: { actionHash: 'c3', parentActionHash: ROOT, childActionHash: C, siblingOrder: 0 },
  },
}

describe('resolveRef — one node, three stable referents', () => {
  it('resolves a node by its actionHash, its hashCodeId, and its handle to the same node', () => {
    expect(resolveRef(project, ROOT)).toBe(ROOT)
    expect(resolveRef(project, hashCodeId(ROOT))).toBe(ROOT)
    expect(resolveRef(project, 'root-node')).toBe(ROOT)
  })

  it('resolves another node by its handle', () => {
    expect(resolveRef(project, 'alpha')).toBe(A)
    expect(resolveRef(project, hashCodeId(A))).toBe(A)
  })

  it('returns null (unresolved) for an unknown ref', () => {
    expect(resolveRef(project, 'no-such-handle')).toBeNull()
    expect(resolveRef(project, '999999')).toBeNull()
    expect(resolveRef(project, '')).toBeNull()
    expect(resolveRef(project, undefined)).toBeNull()
  })
})

describe('casual relative path — <ancestor>/<index>, left-to-right, ephemeral', () => {
  it('children are ordered left-to-right (highest siblingOrder first)', () => {
    expect(childrenLeftToRight(project, ROOT)).toEqual([A, B, C])
  })

  it('resolves a path by handle ancestor + index', () => {
    expect(resolveRef(project, 'root-node/0')).toBe(A)
    expect(resolveRef(project, 'root-node/1')).toBe(B)
    expect(resolveRef(project, 'root-node/2')).toBe(C)
  })

  it('resolves a path by hashCodeId ancestor', () => {
    expect(resolveRef(project, `${hashCodeId(ROOT)}/0`)).toBe(A)
  })

  it('returns null for an out-of-range or malformed index', () => {
    expect(resolveRef(project, 'root-node/9')).toBeNull()
    expect(resolveRef(project, 'root-node/-1')).toBeNull()
    expect(resolveRef(project, 'root-node/x')).toBeNull()
    expect(resolveRef(project, 'no-such/0')).toBeNull()
  })
})

describe('buildNodeRefs — read_tree exposes {actionHash, hashCodeId, handle?}', () => {
  it('includes handle alongside actionHash and hashCodeId for each node', () => {
    const refs = buildNodeRefs(project)
    expect(refs[ROOT]).toEqual({
      actionHash: ROOT,
      hashCodeId: hashCodeId(ROOT),
      handle: 'root-node',
    })
    // a node with no handle has handle: undefined, still carries the two ids
    expect(refs[B]).toEqual({
      actionHash: B,
      hashCodeId: hashCodeId(B),
      handle: undefined,
    })
  })
})

describe('handle uniqueness (per project)', () => {
  it('collectHandleMap maps each handle to its node', () => {
    expect(collectHandleMap(project).get('alpha')).toBe(A)
    expect(collectHandleMap(project).get('root-node')).toBe(ROOT)
  })

  it('handleConflict reports the owner when a handle is taken by another node', () => {
    expect(handleConflict(project, 'alpha')).toBe(A)
    // not a conflict for the node that already owns it
    expect(handleConflict(project, 'alpha', A)).toBeUndefined()
    // free handle
    expect(handleConflict(project, 'brand-new')).toBeUndefined()
  })

  it('isHandleAvailable is the inverse of a conflict', () => {
    expect(isHandleAvailable(project, 'alpha')).toBe(false)
    expect(isHandleAvailable(project, 'alpha', A)).toBe(true)
    expect(isHandleAvailable(project, 'brand-new')).toBe(true)
    expect(isHandleAvailable(project, '')).toBe(true) // empty is always available
  })
})

describe('nodeDisplayLabel — handle ?? hashCodeId', () => {
  it('shows the handle when present', () => {
    expect(nodeDisplayLabel(project.outcomes[ROOT])).toBe('root-node')
  })
  it('falls back to the hashCodeId when no handle', () => {
    expect(nodeDisplayLabel(project.outcomes[B])).toBe(hashCodeId(B))
  })
})

describe('remapDiffRefs — route propose_edits targets through resolveRef', () => {
  const emptyDelta = () => ({ added: {}, updated: {}, removed: [] })
  const baseDiff = (): ProjectDiff => ({
    outcomes: emptyDelta(),
    connections: emptyDelta(),
    tags: emptyDelta(),
    outcomeMembers: emptyDelta(),
    outcomeComments: emptyDelta(),
    entryPoints: emptyDelta(),
  })

  it('remaps an updated-outcome keyed by handle to its actionHash', () => {
    const diff = baseDiff()
    diff.outcomes.updated = { alpha: { content: 'edited a' } }
    const { diff: out, unresolved } = remapDiffRefs(project, diff)
    expect(unresolved).toEqual([])
    expect(out.outcomes.updated[A]).toEqual({ content: 'edited a', actionHash: A })
    expect(out.outcomes.updated['alpha']).toBeUndefined()
  })

  it('leaves an actionHash key untouched and keeps a just-added node as-is', () => {
    const diff = baseDiff()
    diff.outcomes.added = { 'draft:1': { content: 'new' } }
    diff.outcomes.updated = { [ROOT]: { content: 'edited root' } }
    diff.connections.added = {
      k1: { parentActionHash: 'root-node', childActionHash: 'draft:1', siblingOrder: 0 },
    }
    const { diff: out, unresolved } = remapDiffRefs(project, diff)
    expect(out.outcomes.updated[ROOT]).toBeDefined()
    // connection parent (handle) resolves to ROOT; child is a node added in this diff
    expect(out.connections.added.k1.parentActionHash).toBe(ROOT)
    expect(out.connections.added.k1.childActionHash).toBe('draft:1')
    expect(unresolved).toEqual([])
  })

  it('reports an unresolved reference rather than silently dropping it', () => {
    const diff = baseDiff()
    diff.outcomes.updated = { 'ghost-handle': { content: 'x' } }
    const { unresolved } = remapDiffRefs(project, diff)
    expect(unresolved).toContain('ghost-handle')
  })
})
