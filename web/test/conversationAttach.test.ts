import {
  AttachTree,
  computeAttachTarget,
  lowestCommonAncestor,
} from '../src/harness/conversationAttach'

// root ── A ── A1
//   │      └── A2
//   └──── B ── B1
const tree: AttachTree = {
  outcomes: { root: {}, A: {}, A1: {}, A2: {}, B: {}, B1: {} },
  connections: {
    c1: { parentActionHash: 'root', childActionHash: 'A' },
    c2: { parentActionHash: 'root', childActionHash: 'B' },
    c3: { parentActionHash: 'A', childActionHash: 'A1' },
    c4: { parentActionHash: 'A', childActionHash: 'A2' },
    c5: { parentActionHash: 'B', childActionHash: 'B1' },
  },
}

describe('lowestCommonAncestor', () => {
  it('two siblings resolve to their shared parent', () => {
    expect(lowestCommonAncestor(tree, ['A1', 'A2'])).toBe('A')
  })
  it('a node and its descendant resolve to the ancestor', () => {
    expect(lowestCommonAncestor(tree, ['A', 'A1'])).toBe('A')
  })
  it('a single node is its own LCA', () => {
    expect(lowestCommonAncestor(tree, ['A1'])).toBe('A1')
  })
  it('nodes in unrelated branches resolve to the root', () => {
    expect(lowestCommonAncestor(tree, ['A1', 'B1'])).toBe('root')
  })
  it('empty / unknown ids resolve to null', () => {
    expect(lowestCommonAncestor(tree, [])).toBeNull()
    expect(lowestCommonAncestor(tree, ['nope'])).toBeNull()
  })
})

describe('computeAttachTarget', () => {
  it('edits under one branch -> that branch (reason lca)', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['A1', 'A2'], anchor: null })
    ).toEqual({ target: 'A', reason: 'lca' })
  })

  it('a single edited node -> itself (reason lca)', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['A1'], anchor: 'B1' })
    ).toEqual({ target: 'A1', reason: 'lca' })
  })

  it('edits spanning unrelated branches -> root, reason prompt (ask, do not dump at top)', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['A1', 'B1'], anchor: null })
    ).toEqual({ target: 'root', reason: 'prompt' })
  })

  it('editing only the root legitimately targets it (not a prompt)', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['root'], anchor: null })
    ).toEqual({ target: 'root', reason: 'lca' })
  })

  it('folds an ancestor anchor into the LCA, raising the target up to the branch that was open', () => {
    // Edited only A1, but the conversation was opened against its parent A —
    // the anchor lifts the target from A1 up to A (the branch it shaped).
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['A1'], anchor: 'A' })
    ).toEqual({ target: 'A', reason: 'lca' })
  })

  it('an unrelated anchor never drags a well-scoped edit set up to the root', () => {
    // Edits are all under A; a stray anchor in B must not pull the target to root.
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['A1', 'A2'], anchor: 'root' })
    ).toEqual({ target: 'A', reason: 'lca' })
    // (the earlier 'single edited node + unrelated anchor' case also stays at A1)
  })

  it('no edits -> the anchor (first-turn selection), reason anchor', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: [], anchor: 'B' })
    ).toEqual({ target: 'B', reason: 'anchor' })
  })

  it('no edits and no anchor -> reason none', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: [], anchor: null })
    ).toEqual({ target: null, reason: 'none' })
  })

  it('ignores unknown edited ids and unknown anchors', () => {
    expect(
      computeAttachTarget({ tree, editedNodeIds: ['ghost'], anchor: 'ghost' })
    ).toEqual({ target: null, reason: 'none' })
  })
})
