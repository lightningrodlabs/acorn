import { readTree, readSelection } from '../src/harness/readTree'
import hashCodeId from '../src/api/clientSideIdHash'
import { collectExportProjectData } from '../src/migrating/export'
import { DIFF_COLLECTIONS } from '../src/migrating/projectDiff'

// A minimal state where every collection shares one cell id, so a single
// projectId pulls a fully-populated snapshot. (mockPopulatedState keys each
// collection under a DIFFERENT cell id, which suits the export flow's mocks but
// not a single-project read.)
const CELL = 'testCellId'
const state: any = {
  projects: {
    projectMeta: { [CELL]: { name: 'Living spec', actionHash: 'pmHash' } },
    outcomes: { [CELL]: { o1: { content: 'root outcome' } } },
    connections: {
      [CELL]: { c1: { parentActionHash: 'o1', childActionHash: 'o2' } },
    },
    outcomeMembers: { [CELL]: {} },
    outcomeComments: { [CELL]: {} },
    entryPoints: { [CELL]: {} },
    tags: { [CELL]: { t1: { text: 'spec' } } },
  },
}

describe('readTree', () => {
  it('returns the live tree as a ProjectSnapshot for the given project', () => {
    const snap = readTree(state, CELL)
    expect(snap.outcomes).toEqual({ o1: { content: 'root outcome' } })
    expect(snap.connections).toEqual({
      c1: { parentActionHash: 'o1', childActionHash: 'o2' },
    })
    expect(snap.tags).toEqual({ t1: { text: 'spec' } })
  })

  it('delegates to collectExportProjectData (single source of truth)', () => {
    expect(readTree(state, CELL)).toEqual(collectExportProjectData(state, CELL))
  })

  it('yields empty diffable collections for an unknown project rather than throwing', () => {
    const snap = readTree(state, 'missingCell')
    for (const collection of DIFF_COLLECTIONS) {
      expect(snap[collection]).toEqual({})
    }
  })
})

describe('readSelection', () => {
  const selState: any = {
    ...state,
    ui: { selection: { selectedOutcomes: ['o1'] } },
  }

  it('resolves selected nodes to {actionHash, display id, content}', () => {
    expect(readSelection(selState, CELL)).toEqual([
      { actionHash: 'o1', id: hashCodeId('o1'), content: 'root outcome' },
    ])
  })

  it('returns [] when nothing is selected (no ui state)', () => {
    expect(readSelection(state, CELL)).toEqual([])
  })
})
