import {
  readTree,
  readSelection,
  preserveConversationArtifacts,
} from '../src/harness/readTree'
import hashCodeId from '../src/api/clientSideIdHash'
import { collectExportProjectData } from '../src/migrating/export'
import { DIFF_COLLECTIONS } from '../src/migrating/projectDiff'
import { parseFields, serializeFields } from '../src/outcomeFields'

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

// A conversation artifact carries an ENTIRE serialized transcript in its `uri`,
// so the agent-facing snapshot strips them by default — they bloat every tree
// read and are irrelevant unless the agent is explicitly reading history.
describe('conversation artifact stripping', () => {
  const convo = {
    type: 'conversation',
    label: 'Shaping chat',
    uri: '{"sessionId":"s1","title":"Shaping chat","messages":[]}',
  }
  const link = { type: 'output', label: 'PR', uri: 'https://example.com/pr/1' }
  const withBoth = serializeFields({
    outcome: 'target state',
    spec: 'the spec',
    artifacts: [convo, link],
  })
  const convoOnly = serializeFields({ outcome: 'x', artifacts: [convo] })
  const plain = serializeFields({ outcome: 'no artifacts here' })

  const stripState: any = {
    ...state,
    projects: {
      ...state.projects,
      outcomes: {
        [CELL]: {
          o1: { content: 'root', description: withBoth },
          o2: { content: 'leaf', description: convoOnly },
          o3: { content: 'bare', description: plain },
        },
      },
    },
  }

  it('strips conversation artifacts but keeps other artifacts and fields', () => {
    const snap = readTree(stripState, CELL)
    const fields = parseFields((snap.outcomes as any).o1.description)
    expect(fields.artifacts).toEqual([link])
    expect(fields.spec).toBe('the spec')
    expect(fields.outcome).toBe('target state')
  })

  it('removes the artifacts key entirely when only conversations were attached', () => {
    const snap = readTree(stripState, CELL)
    const fields = parseFields((snap.outcomes as any).o2.description)
    expect(fields.artifacts).toBeUndefined()
  })

  it('leaves nodes without conversations byte-identical (stable for diffing)', () => {
    const snap = readTree(stripState, CELL)
    expect((snap.outcomes as any).o3.description).toBe(plain)
  })

  it('includeConversations keeps them (for explicit history reads)', () => {
    const snap = readTree(stripState, CELL, { includeConversations: true })
    const fields = parseFields((snap.outcomes as any).o1.description)
    expect(fields.artifacts).toEqual([convo, link])
  })
})

// The write-path counterpart: the agent never sees conversation artifacts, so its
// proposed description must get the live node's conversations re-grafted, or a
// wholesale outcome replacement on Confirm would silently drop them.
describe('preserveConversationArtifacts', () => {
  const convo = {
    type: 'conversation',
    label: 'Chat',
    uri: '{"sessionId":"s1","messages":[]}',
  }
  const link = { type: 'output', label: 'PR', uri: 'https://example.com' }

  it('re-adds the live conversations to an agent-edited description', () => {
    const live = serializeFields({ outcome: 'old', artifacts: [convo, link] })
    const proposed = serializeFields({
      outcome: 'agent-improved',
      spec: 'added by agent',
      artifacts: [link],
    })
    const merged = parseFields(preserveConversationArtifacts(live, proposed))
    expect(merged.outcome).toBe('agent-improved')
    expect(merged.spec).toBe('added by agent')
    expect(merged.artifacts).toEqual([link, convo])
  })

  it('returns the proposal untouched when the live node has no conversations', () => {
    const live = serializeFields({ outcome: 'old', artifacts: [link] })
    const proposed = serializeFields({ outcome: 'new' })
    expect(preserveConversationArtifacts(live, proposed)).toBe(proposed)
  })

  it('drops spurious agent-authored conversations so live ones never duplicate', () => {
    const live = serializeFields({ outcome: 'old', artifacts: [convo] })
    const fake = { type: 'conversation', label: 'Hallucinated', uri: '{}' }
    const proposed = serializeFields({ outcome: 'new', artifacts: [fake] })
    const merged = parseFields(preserveConversationArtifacts(live, proposed))
    expect(merged.artifacts).toEqual([convo])
  })
})
