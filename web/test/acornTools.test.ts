import { createStore } from 'redux'
import rootReducer from '../src/redux/reducer'
import { setActiveProject } from '../src/redux/ephemeral/active-project/actions'
import { handleAcornToolCall } from '../src/harness/acornTools'
import { ProjectDiff } from '../src/migrating/projectDiff'

// L1 (executable) — the renderer-side tool handler. propose_edits opens an inert
// draft (no DHT write); read_tree reads the live snapshot. The handler dispatches
// only redux actions — it imports no zome API — so "nothing reaches the DHT until
// Confirm" holds by construction; we assert the observable: a draft opens.

const PROJECT = 'cell-xyz'

const diff = (): ProjectDiff => ({
  outcomes: {
    added: { 'draft:1': { actionHash: 'draft:1', content: 'Proposed' } },
    updated: {},
    removed: [],
  },
  connections: { added: {}, updated: {}, removed: [] },
  tags: { added: {}, updated: {}, removed: [] },
  outcomeMembers: { added: {}, updated: {}, removed: [] },
  outcomeComments: { added: {}, updated: {}, removed: [] },
  entryPoints: { added: {}, updated: {}, removed: [] },
})

const makeStore = () => {
  const store = createStore(rootReducer)
  store.dispatch(setActiveProject(PROJECT))
  return store
}

beforeAll(() => {
  jest.useFakeTimers() // suppress the deferred fitToChanged
})
afterAll(() => {
  jest.useRealTimers()
})

describe('handleAcornToolCall', () => {
  test('read_tree returns the live ProjectSnapshot', async () => {
    const store = makeStore()
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'read_tree',
      args: {},
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.result).toHaveProperty('outcomes')
  })

  test('propose_edits opens a draft (inert) and reports it', async () => {
    const store = makeStore()
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: diff() },
    })
    expect(res.ok).toBe(true)
    // the draft is now open for the project — but nothing committed
    const draft = store.getState().ui.draft
    expect(draft.diff).not.toBeNull()
    expect(draft.projectId).toBe(PROJECT)
    // the persisted tree is untouched (no DHT write)
    expect(store.getState().projects.outcomes[PROJECT]).toBeUndefined()
  })

  test('propose_edits accepts the diff directly (no { diff } wrapper)', async () => {
    const store = makeStore()
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: diff(),
    })
    expect(res.ok).toBe(true)
    expect(store.getState().ui.draft.diff).not.toBeNull()
  })

  test('propose_edits rejects a non-ProjectDiff payload', async () => {
    const store = makeStore()
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: { not: 'a diff' } },
    })
    expect(res.ok).toBe(false)
    expect(store.getState().ui.draft.diff).toBeNull()
  })

  test('an unknown tool is reported, not thrown', async () => {
    const store = makeStore()
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'delete_everything',
      args: {},
    })
    expect(res.ok).toBe(false)
  })
})
