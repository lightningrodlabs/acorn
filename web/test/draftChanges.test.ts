import {
  enumerateChanges,
  effectiveDiff,
  changeKey,
  isAccepted,
} from '../src/redux/ephemeral/draft/changes'
import { ProjectDiff } from '../src/migrating/projectDiff'

// L3 — per-change accept/reject + inline edit. The "effective draft" derivation
// (decisions + inline edits applied) is the executable contract: the accepted +
// edited subset is exactly what would commit.

const diff = (): ProjectDiff => ({
  outcomes: {
    added: {
      'draft:1': { actionHash: 'draft:1', content: 'New A' },
      'draft:2': { actionHash: 'draft:2', content: 'New B' },
    },
    updated: { liveX: { actionHash: 'liveX', content: 'X edited' } },
    removed: ['liveGone'],
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

describe('enumerateChanges', () => {
  test('lists every added/updated/removed change with a stable key', () => {
    const rows = enumerateChanges(diff())
    const keys = rows.map((r) => r.key)
    expect(keys).toContain('outcomes:added:draft:1')
    expect(keys).toContain('outcomes:added:draft:2')
    expect(keys).toContain('outcomes:updated:liveX')
    expect(keys).toContain('outcomes:removed:liveGone')
    expect(keys).toContain('connections:added:draft:c1')
    // removed rows carry no entry payload
    const removedRow = rows.find((r) => r.op === 'removed')
    expect(removedRow!.entry).toBeNull()
  })
})

describe('effectiveDiff matrix', () => {
  test('accept-all: identical to the proposal', () => {
    const eff = effectiveDiff(diff(), {})
    expect(Object.keys(eff.outcomes.added).sort()).toEqual(['draft:1', 'draft:2'])
    expect(Object.keys(eff.outcomes.updated)).toEqual(['liveX'])
    expect(eff.outcomes.removed).toEqual(['liveGone'])
    expect(Object.keys(eff.connections.added)).toEqual(['draft:c1'])
  })

  test('reject-some: rejected adds + the removal drop out', () => {
    const decisions = {
      [changeKey('outcomes', 'added', 'draft:2')]: false,
      [changeKey('outcomes', 'removed', 'liveGone')]: false,
    }
    const eff = effectiveDiff(diff(), decisions)
    expect(Object.keys(eff.outcomes.added)).toEqual(['draft:1'])
    expect(eff.outcomes.removed).toEqual([])
    // untouched changes survive
    expect(Object.keys(eff.outcomes.updated)).toEqual(['liveX'])
    expect(Object.keys(eff.connections.added)).toEqual(['draft:c1'])
  })

  test('edit-then-accept: an inline-edited entry commits with its edit', () => {
    // an inline edit is modeled as the entry already being mutated in the diff
    const edited = diff()
    edited.outcomes.added['draft:1'] = {
      actionHash: 'draft:1',
      content: 'New A (renamed)',
    }
    const eff = effectiveDiff(edited, {})
    expect(eff.outcomes.added['draft:1'].content).toBe('New A (renamed)')
  })

  test('isAccepted defaults to accept and honors explicit reject', () => {
    expect(isAccepted({}, 'any')).toBe(true)
    expect(isAccepted({ any: false }, 'any')).toBe(false)
    expect(isAccepted({ any: true }, 'any')).toBe(true)
  })
})
