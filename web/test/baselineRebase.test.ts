/**
 * baselineRebase — the pure layer of the baseline-rebase leaf: canonical
 * stable-stringify, snapshot-hash baseline identity, the renderer-held
 * BaselineStore, and the three-way rebase with its conflict matrix
 * (the leaf's executable criterion: agent-only change applies; human-only
 * change persists; both-changed same-field flags a conflict).
 */
import {
  stableStringify,
  hashSnapshot,
  BaselineStore,
  rebaseDiff,
  describeRebase,
} from '../src/harness/baselineRebase'
import { normalizeDiff, ProjectDiff } from '../src/migrating/projectDiff'

const node = (over: any = {}) => ({
  content: 'a node',
  description: '{"outcome":"original"}',
  scope: { Small: { achievementStatus: 'NotAchieved', targetDate: null, taskList: [] } },
  tags: [],
  githubLink: '',
  creatorAgentPubKey: 'uhCAkCreator',
  editorAgentPubKey: 'uhCAkEditor',
  timestampCreated: 1,
  timestampUpdated: 2,
  isImported: false,
  ...over,
})

const snapshot = (outcomes: any) => ({
  outcomes,
  connections: {},
  tags: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
})

const updateDiff = (hash: string, entry: any): ProjectDiff =>
  normalizeDiff({ outcomes: { updated: { [hash]: entry } } } as any)

describe('stableStringify', () => {
  it('is invariant to object key insertion order, recursively', () => {
    const a = { x: 1, y: { b: 2, a: [1, { q: 1, p: 2 }] } }
    const b = { y: { a: [1, { p: 2, q: 1 }], b: 2 }, x: 1 }
    expect(stableStringify(a)).toEqual(stableStringify(b))
  })
  it('drops undefined-valued keys, matching JSON.stringify semantics', () => {
    expect(stableStringify({ a: 1, b: undefined })).toEqual(
      stableStringify({ a: 1 })
    )
  })
  it('preserves array order — it is semantic', () => {
    expect(stableStringify([1, 2])).not.toEqual(stableStringify([2, 1]))
  })
})

describe('hashSnapshot (baseline identity)', () => {
  it('gives equal ids for structurally equal snapshots with different key order', () => {
    const s1 = snapshot({ h1: node(), h2: node({ content: 'other' }) })
    const s2 = snapshot({ h2: node({ content: 'other' }), h1: node() })
    expect(hashSnapshot(s1)).toEqual(hashSnapshot(s2))
  })
  it('changes when any diffable content changes', () => {
    const s1 = snapshot({ h1: node() })
    const s2 = snapshot({ h1: node({ description: '{"outcome":"edited"}' }) })
    expect(hashSnapshot(s1)).not.toEqual(hashSnapshot(s2))
  })
  it('ignores decoration outside the diffable collections (nodeRefs, baselineId)', () => {
    const s = snapshot({ h1: node() })
    expect(hashSnapshot({ ...s, nodeRefs: { h1: {} }, baselineId: 'zzz' })).toEqual(
      hashSnapshot(s)
    )
  })
})

describe('BaselineStore', () => {
  it('records and retrieves by id; remembers the latest per session', () => {
    const store = new BaselineStore()
    const s1 = snapshot({ h1: node() })
    const s2 = snapshot({ h1: node({ content: 'later' }) })
    const id1 = store.record(s1, 'sessA')
    const id2 = store.record(s2, 'sessA')
    expect(store.get(id1)).toBe(s1)
    expect(store.get(id2)).toBe(s2)
    expect(store.latestForSession('sessA')).toEqual(id2)
    expect(store.latestForSession('sessB')).toBeUndefined()
  })
  it('caps retained baselines, evicting the least recently recorded', () => {
    const store = new BaselineStore()
    const ids: string[] = []
    for (let i = 0; i < 20; i++)
      ids.push(store.record(snapshot({ h1: node({ content: `v${i}` }) })))
    expect(store.get(ids[0])).toBeUndefined()
    expect(store.get(ids[19])).toBeDefined()
  })
})

describe('rebaseDiff (three-way merge)', () => {
  const base = snapshot({ h1: node() })

  it('agent-only change applies untouched, clean rebase', () => {
    const live = snapshot({ h1: node() }) // human changed nothing
    const proposal = updateDiff('h1', node({ description: '{"outcome":"agent"}' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.rebasedFields).toEqual(0)
    expect(r.diff.outcomes.updated['h1'].description).toEqual(
      '{"outcome":"agent"}'
    )
    expect(describeRebase(r)).toMatch(/clean/)
  })

  it("human-only change persists: the live value is carried into the proposal", () => {
    // human retitled the node; agent's proposal (computed pre-edit) still holds
    // the baseline title but edits only the description
    const live = snapshot({ h1: node({ content: 'human retitled' }) })
    const proposal = updateDiff('h1', node({ description: '{"outcome":"agent"}' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.rebasedFields).toEqual(1)
    const merged = r.diff.outcomes.updated['h1']
    expect(merged.content).toEqual('human retitled') // NOT reverted to baseline
    expect(merged.description).toEqual('{"outcome":"agent"}')
  })

  it('both changed the same field differently: conflict, live wins by default', () => {
    const live = snapshot({ h1: node({ description: '{"outcome":"human"}' }) })
    const proposal = updateDiff('h1', node({ description: '{"outcome":"agent"}' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toHaveLength(1)
    expect(r.conflicts[0]).toMatchObject({
      hash: 'h1',
      field: 'description',
      kind: 'same-field',
      live: '{"outcome":"human"}',
      proposed: '{"outcome":"agent"}',
    })
    expect(r.diff.outcomes.updated['h1'].description).toEqual(
      '{"outcome":"human"}'
    )
    expect(describeRebase(r)).toMatch(/1 conflict/)
  })

  it('both changed a field to the same value: no conflict', () => {
    const live = snapshot({ h1: node({ content: 'agreed' }) })
    const proposal = updateDiff('h1', node({ content: 'agreed' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.diff.outcomes.updated['h1'].content).toEqual('agreed')
  })

  it('update of a node the human deleted: conflict, deletion wins, update dropped', () => {
    const live = snapshot({}) // h1 is gone
    const proposal = updateDiff('h1', node({ content: 'agent edit' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toHaveLength(1)
    expect(r.conflicts[0].kind).toEqual('updated-but-deleted')
    expect(r.diff.outcomes.updated['h1']).toBeUndefined()
  })

  it('removal of a node the human edited: conflict, the node survives', () => {
    const live = snapshot({ h1: node({ content: 'freshly edited' }) })
    const proposal = normalizeDiff({ outcomes: { removed: ['h1'] } } as any)
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toHaveLength(1)
    expect(r.conflicts[0].kind).toEqual('removed-but-edited')
    expect(r.diff.outcomes.removed).toEqual([])
  })

  it('removal of an untouched node passes through; already-gone removal is a no-op', () => {
    const base2 = snapshot({ h1: node(), h2: node() })
    const live = snapshot({ h1: node() }) // h2 already deleted by the human too
    const proposal = normalizeDiff({
      outcomes: { removed: ['h1', 'h2'] },
    } as any)
    const r = rebaseDiff(base2, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.diff.outcomes.removed).toEqual(['h1'])
  })

  it('bookkeeping fields (editor, timestamps) never conflict', () => {
    const live = snapshot({
      h1: node({ editorAgentPubKey: 'uhCAkHuman', timestampUpdated: 99 }),
    })
    const proposal = updateDiff('h1', node({ content: 'agent edit' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.rebasedFields).toEqual(0)
  })

  it('a node unknown to the baseline passes through untouched', () => {
    const live = snapshot({ h1: node(), hNew: node({ content: 'brand new' }) })
    const proposal = updateDiff('hNew', node({ content: 'agent tweak' }))
    const r = rebaseDiff(base, live, proposal)
    expect(r.conflicts).toEqual([])
    expect(r.diff.outcomes.updated['hNew'].content).toEqual('agent tweak')
  })
})
