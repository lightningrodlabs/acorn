import {
  activeEffectiveDiff,
  overlayProject,
} from '../src/redux/ephemeral/draft/changes'
import outcomesAsGraph from '../src/redux/persistent/projects/outcomes/outcomesAsGraph'
import { ProjectDiff } from '../src/migrating/projectDiff'

// L2 — the render overlay merges an open draft over the persisted slices for
// rendering only, so proposed nodes/edges show (and layout positions them)
// without any DHT write.

// minimal scope so computeAchievementStatus (run by outcomesAsGraph) is happy
const scope = { Uncertain: {} }

const diff = (): ProjectDiff => ({
  outcomes: {
    added: {
      'draft:1': { actionHash: 'draft:1', content: 'Proposed child', scope },
    },
    updated: { liveA: { actionHash: 'liveA', content: 'A (edited)', scope } },
    removed: [],
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

const baseOutcomes = {
  liveRoot: { actionHash: 'liveRoot', content: 'Root', scope },
  liveA: { actionHash: 'liveA', content: 'A', scope },
}
const baseConnections = {}

describe('activeEffectiveDiff (project scoping)', () => {
  test('returns null when no draft is open', () => {
    expect(
      activeEffectiveDiff({ diff: null, decisions: {}, projectId: null }, 'p1')
    ).toBeNull()
  })

  test('returns null when the draft belongs to a different project', () => {
    expect(
      activeEffectiveDiff({ diff: diff(), decisions: {}, projectId: 'p2' }, 'p1')
    ).toBeNull()
  })

  test('returns the decisions-applied diff for the matching project', () => {
    const eff = activeEffectiveDiff(
      { diff: diff(), decisions: {}, projectId: 'p1' },
      'p1'
    )
    expect(eff).not.toBeNull()
    expect(Object.keys(eff!.outcomes.added)).toEqual(['draft:1'])
  })
})

describe('overlayProject + outcomesAsGraph', () => {
  test('a draft-added node appears in the computed graph as a child of its parent', () => {
    const eff = activeEffectiveDiff(
      { diff: diff(), decisions: {}, projectId: 'p1' },
      'p1'
    )
    const { outcomes, connections } = overlayProject(
      baseOutcomes,
      baseConnections,
      eff
    )
    const graph = outcomesAsGraph({ outcomes, connections })
    const keyed = graph.outcomes.computedOutcomesKeyed
    // the ghost node is in the graph
    expect(keyed['draft:1']).toBeDefined()
    expect(keyed['draft:1'].content).toBe('Proposed child')
    // and nested under liveRoot via the draft connection
    expect(keyed['liveRoot'].children.map((c: any) => c.actionHash)).toContain(
      'draft:1'
    )
  })

  test('a draft-updated node renders its proposed value', () => {
    const eff = activeEffectiveDiff(
      { diff: diff(), decisions: {}, projectId: 'p1' },
      'p1'
    )
    const { outcomes } = overlayProject(baseOutcomes, baseConnections, eff)
    expect(outcomes.liveA.content).toBe('A (edited)')
  })

  test('with no draft, the persisted slices pass through untouched', () => {
    const { outcomes, connections } = overlayProject(
      baseOutcomes,
      baseConnections,
      null
    )
    expect(outcomes).toBe(baseOutcomes)
    expect(connections).toBe(baseConnections)
  })

  test('rejecting the added node removes its ghost from the graph', () => {
    const eff = activeEffectiveDiff(
      { diff: diff(), decisions: { 'outcomes:added:draft:1': false }, projectId: 'p1' },
      'p1'
    )
    const { outcomes } = overlayProject(baseOutcomes, baseConnections, eff)
    expect(outcomes['draft:1']).toBeUndefined()
  })
})
