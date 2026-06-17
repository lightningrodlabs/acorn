import reducer, { DraftState } from '../src/redux/ephemeral/draft/reducer'
import {
  openDraft,
  updateDraft,
  setChangeDecision,
  updateDraftEntry,
  clearDraft,
} from '../src/redux/ephemeral/draft/actions'
import {
  changeKey,
  effectiveDiff,
  isEmptyEffective,
  overlayCollection,
} from '../src/redux/ephemeral/draft/changes'
import { ProjectDiff } from '../src/migrating/projectDiff'

// A small draft diff: add outcome draft:1, update live outcome liveA, add a
// connection linking liveRoot -> draft:1, remove outcome liveOld.
const diff = (): ProjectDiff => ({
  outcomes: {
    added: { 'draft:1': { actionHash: 'draft:1', content: 'New node' } },
    updated: { liveA: { actionHash: 'liveA', content: 'A edited' } },
    removed: ['liveOld'],
  },
  connections: {
    added: {
      'draft:c1': {
        actionHash: 'draft:c1',
        parentActionHash: 'liveRoot',
        childActionHash: 'draft:1',
      },
    },
    updated: {},
    removed: [],
  },
  tags: { added: {}, updated: {}, removed: [] },
  outcomeMembers: { added: {}, updated: {}, removed: [] },
  outcomeComments: { added: {}, updated: {}, removed: [] },
  entryPoints: { added: {}, updated: {}, removed: [] },
})

describe('draft reducer', () => {
  const initial = reducer(undefined, { type: '@@INIT' })

  test('defaults to no draft', () => {
    expect(initial.diff).toBeNull()
    expect(initial.projectId).toBeNull()
    expect(initial.decisions).toEqual({})
  })

  test('openDraft sets the diff + project and resets decisions', () => {
    const withDecisions: DraftState = {
      diff: diff(),
      projectId: 'old',
      decisions: { 'outcomes:added:draft:1': false },
    }
    const next = reducer(withDecisions, openDraft(diff(), 'cell-1'))
    expect(next.projectId).toBe('cell-1')
    expect(next.diff).not.toBeNull()
    expect(next.decisions).toEqual({})
  })

  test('updateDraft swaps the diff but keeps project + decisions', () => {
    const opened = reducer(initial, openDraft(diff(), 'cell-1'))
    const decided = reducer(opened, setChangeDecision('outcomes:updated:liveA', false))
    const revised = diff()
    revised.outcomes.added = {}
    const next = reducer(decided, updateDraft(revised))
    expect(next.projectId).toBe('cell-1')
    expect(next.decisions).toEqual({ 'outcomes:updated:liveA': false })
    expect(Object.keys(next.diff!.outcomes.added)).toHaveLength(0)
  })

  test('setChangeDecision records accept/reject; no-op without a draft', () => {
    expect(reducer(initial, setChangeDecision('x', false)).decisions).toEqual({})
    const opened = reducer(initial, openDraft(diff(), 'cell-1'))
    const next = reducer(opened, setChangeDecision('outcomes:added:draft:1', false))
    expect(next.decisions['outcomes:added:draft:1']).toBe(false)
  })

  test('updateDraftEntry edits an added entry in place', () => {
    const opened = reducer(initial, openDraft(diff(), 'cell-1'))
    const edited = reducer(
      opened,
      updateDraftEntry('outcomes', 'added', 'draft:1', {
        actionHash: 'draft:1',
        content: 'Renamed',
      })
    )
    expect(edited.diff!.outcomes.added['draft:1'].content).toBe('Renamed')
    // original object untouched (immutability)
    expect(opened.diff!.outcomes.added['draft:1'].content).toBe('New node')
  })

  test('updateDraftEntry ignores a hash that is not in the draft', () => {
    const opened = reducer(initial, openDraft(diff(), 'cell-1'))
    const same = reducer(
      opened,
      updateDraftEntry('outcomes', 'updated', 'nope', { content: 'x' })
    )
    expect(same.diff).toBe(opened.diff)
  })

  test('clearDraft wipes everything', () => {
    const opened = reducer(initial, openDraft(diff(), 'cell-1'))
    const cleared = reducer(opened, clearDraft())
    expect(cleared.diff).toBeNull()
    expect(cleared.projectId).toBeNull()
    expect(cleared.decisions).toEqual({})
  })
})

describe('effectiveDiff (decisions applied)', () => {
  test('default-accept: no decisions => the diff is unchanged', () => {
    const eff = effectiveDiff(diff(), {})
    expect(Object.keys(eff.outcomes.added)).toEqual(['draft:1'])
    expect(Object.keys(eff.outcomes.updated)).toEqual(['liveA'])
    expect(eff.outcomes.removed).toEqual(['liveOld'])
  })

  test('rejecting an added node drops it from the effective diff', () => {
    const eff = effectiveDiff(diff(), {
      [changeKey('outcomes', 'added', 'draft:1')]: false,
    })
    expect(Object.keys(eff.outcomes.added)).toHaveLength(0)
    // other changes survive
    expect(Object.keys(eff.outcomes.updated)).toEqual(['liveA'])
  })

  test('rejecting a removal keeps the node in the tree (drops it from removed)', () => {
    const eff = effectiveDiff(diff(), {
      [changeKey('outcomes', 'removed', 'liveOld')]: false,
    })
    expect(eff.outcomes.removed).toEqual([])
  })

  test('rejecting an update reverts that field to base', () => {
    const eff = effectiveDiff(diff(), {
      [changeKey('outcomes', 'updated', 'liveA')]: false,
    })
    expect(Object.keys(eff.outcomes.updated)).toHaveLength(0)
  })

  test('rejecting everything yields an empty effective diff', () => {
    const eff = effectiveDiff(diff(), {
      [changeKey('outcomes', 'added', 'draft:1')]: false,
      [changeKey('outcomes', 'updated', 'liveA')]: false,
      [changeKey('outcomes', 'removed', 'liveOld')]: false,
      [changeKey('connections', 'added', 'draft:c1')]: false,
    })
    expect(isEmptyEffective(eff)).toBe(true)
  })
})

describe('overlayCollection (render merge)', () => {
  test('adds + updates overlay base; base is not mutated', () => {
    const base = { liveA: { actionHash: 'liveA', content: 'A' } }
    const merged = overlayCollection(base, {
      added: { 'draft:1': { actionHash: 'draft:1', content: 'New' } },
      updated: { liveA: { actionHash: 'liveA', content: 'A edited' } },
    })
    expect(merged['draft:1'].content).toBe('New')
    expect(merged.liveA.content).toBe('A edited')
    // base untouched
    expect(base.liveA.content).toBe('A')
  })
})
