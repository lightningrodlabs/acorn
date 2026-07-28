import { createStore } from 'redux'
import rootReducer from '../src/redux/reducer'
import { setActiveProject } from '../src/redux/ephemeral/active-project/actions'
import { createOutcome } from '../src/redux/persistent/projects/outcomes/actions'
import { handleAcornToolCall } from '../src/harness/acornTools'
import { ProjectDiff } from '../src/migrating/projectDiff'
import { parseFields, serializeFields } from '../src/outcomeFields'

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

  test('propose_edits tolerates a PARTIAL diff (only the collections it touched)', async () => {
    const store = makeStore()
    // an LLM commonly sends just { outcomes: { added: {...} } } with no other
    // collections and no removed[] — this must not crash effectiveDiff/overlay
    const partial: any = {
      outcomes: { added: { 'draft:9': { actionHash: 'draft:9', content: 'X' } } },
    }
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: partial },
    })
    expect(res.ok).toBe(true)
    const draft = store.getState().ui.draft.diff
    // normalized to the full shape
    expect(draft!.connections.added).toEqual({})
    expect(draft!.outcomes.removed).toEqual([])
    expect(Object.keys(draft!.outcomes.added)).toEqual(['draft:9'])
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

  // --- the cross-session draft interlock -------------------------------------
  // The draft slice is one-per-window until per-session drafts land, so with
  // concurrent sessions an open draft may only be revised by the session that
  // proposed it — anything else must fail LEGIBLY, never merge silently.
  describe('draft interlock (concurrent sessions)', () => {
    const propose = (
      store: any,
      content: string,
      sessionId?: string,
      projectId = PROJECT
    ) =>
      handleAcornToolCall(
        store,
        projectId,
        {
          tool: 'propose_edits',
          args: {
            diff: {
              outcomes: {
                added: { 'draft:1': { actionHash: 'draft:1', content } },
              },
            },
          },
        },
        sessionId
      )

    test('a session may revise its OWN open draft', async () => {
      const store = makeStore()
      await propose(store, 'first', 'sessA')
      const res = await propose(store, 'revised', 'sessA')
      expect(res.ok).toBe(true)
      expect(store.getState().ui.draft.sessionId).toBe('sessA')
      expect(
        store.getState().ui.draft.diff!.outcomes.added['draft:1'].content
      ).toBe('revised')
    })

    test("another session's proposal is rejected, and the draft untouched", async () => {
      const store = makeStore()
      await propose(store, 'first', 'sessA')
      const res = await propose(store, 'intruder', 'sessB')
      expect(res.ok).toBe(false)
      if (!res.ok) expect(res.error).toMatch(/another session/)
      // the open draft still belongs to A, content unchanged
      expect(store.getState().ui.draft.sessionId).toBe('sessA')
      expect(
        store.getState().ui.draft.diff!.outcomes.added['draft:1'].content
      ).toBe('first')
    })

    test('an UNATTRIBUTABLE proposal cannot revise a stamped draft', async () => {
      const store = makeStore()
      await propose(store, 'first', 'sessA')
      // the host couldn't tell which session called — it must not be allowed
      // to impersonate the draft's owner
      const res = await propose(store, 'mystery', undefined)
      expect(res.ok).toBe(false)
      expect(
        store.getState().ui.draft.diff!.outcomes.added['draft:1'].content
      ).toBe('first')
    })

    test('an unstamped draft (file/apply path) stays revisable by a session', async () => {
      const store = makeStore()
      // opened with no session stamp, as the human-driven file path does
      await propose(store, 'from file', undefined)
      expect(store.getState().ui.draft.sessionId).toBeNull()
      const res = await propose(store, 'agent refinement', 'sessA')
      expect(res.ok).toBe(true) // pre-interlock behaviour, deliberately kept
      expect(
        store.getState().ui.draft.diff!.outcomes.added['draft:1'].content
      ).toBe('agent refinement')
    })

    test("a draft open for ANOTHER project blocks (never clobbers) a proposal", async () => {
      const store = makeStore()
      await propose(store, 'project one draft', 'sessA')
      const res = await propose(store, 'other project', 'sessB', 'cell-other')
      expect(res.ok).toBe(false)
      if (!res.ok) expect(res.error).toMatch(/different project/)
      // the first project's draft survives intact
      expect(store.getState().ui.draft.projectId).toBe(PROJECT)
      expect(
        store.getState().ui.draft.diff!.outcomes.added['draft:1'].content
      ).toBe('project one draft')
    })

    test('discarding the draft frees the slot for another session', async () => {
      const store = makeStore()
      await propose(store, 'first', 'sessA')
      store.dispatch({ type: 'CLEAR_DRAFT' })
      const res = await propose(store, 'fresh start', 'sessB')
      expect(res.ok).toBe(true)
      expect(store.getState().ui.draft.sessionId).toBe('sessB')
    })
  })

  test('a proposed added outcome is completed to a zome-valid Outcome', async () => {
    const store = makeStore()
    // an LLM minimal entry — missing the fields the integrity zome requires
    const minimal: any = {
      outcomes: {
        added: {
          'draft:1': {
            actionHash: 'draft:1',
            content: 'New node',
            description: '{"outcome":"do it"}',
          },
        },
      },
    }
    await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: minimal },
    })
    const entry = store.getState().ui.draft.diff!.outcomes.added['draft:1']
    // every required Outcome field is now present (else Confirm's zome call fails)
    expect(entry.creatorAgentPubKey).toBeDefined()
    expect(entry).toHaveProperty('editorAgentPubKey')
    expect(typeof entry.timestampCreated).toBe('number')
    expect(entry).toHaveProperty('timestampUpdated')
    expect(typeof entry.isImported).toBe('boolean')
    expect(entry.githubLink).toBe('')
    expect(entry.scope).toBeDefined()
    expect(Array.isArray(entry.tags)).toBe(true)
  })

  test('propose_edits accepts an under-specified connection (parent/child/siblingOrder only)', async () => {
    const store = makeStore()
    // the agent supplies only the meaningful fields; randomizer/isImported are
    // filled by the draft completion step so the draft is committable
    const withConn: any = {
      outcomes: {
        added: { 'draft:1': { actionHash: 'draft:1', content: 'Parent' } },
      },
      connections: {
        added: {
          'draft:c': {
            parentActionHash: 'draft:1',
            childActionHash: 'draft:1',
            siblingOrder: 0,
          },
        },
      },
    }
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: withConn },
    })
    expect(res.ok).toBe(true)
    const conn = store.getState().ui.draft.diff!.connections.added['draft:c']
    expect(typeof conn.randomizer).toBe('number')
    expect(conn.isImported).toBe(false)
  })

  test('propose_edits rejects a malformed connection (missing parent/child) up front', async () => {
    const store = makeStore()
    const bad: any = {
      outcomes: { added: { 'draft:1': { actionHash: 'draft:1', content: 'P' } } },
      connections: {
        added: { 'draft:c': { childActionHash: 'draft:1', siblingOrder: 0 } },
      },
    }
    const res = await handleAcornToolCall(store, PROJECT, {
      tool: 'propose_edits',
      args: { diff: bad },
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/parent/i)
    // no draft opened — nothing reaches the zome
    expect(store.getState().ui.draft.diff).toBeNull()
  })

  // Conversation artifacts (whole transcripts embedded in a node's description)
  // are hidden from the agent on read and re-grafted on write, so an agent edit
  // can never drop a human-attached conversation.
  describe('conversation artifacts across the tool surface', () => {
    const convo = {
      type: 'conversation',
      label: 'Chat',
      uri: '{"sessionId":"s1","messages":[]}',
    }
    const liveDescription = serializeFields({
      outcome: 'the target state',
      artifacts: [convo],
    })
    const seed = (store: ReturnType<typeof makeStore>) =>
      store.dispatch(
        createOutcome(PROJECT, {
          actionHash: 'o1',
          entryHash: 'e1',
          createdAt: 1,
          updatedAt: 1,
          entry: { content: 'Node', description: liveDescription } as any,
        })
      )

    test('read_tree strips conversation artifacts from the snapshot', async () => {
      const store = makeStore()
      seed(store)
      const res = await handleAcornToolCall(store, PROJECT, {
        tool: 'read_tree',
        args: {},
      })
      expect(res.ok).toBe(true)
      if (res.ok) {
        const desc = (res.result as any).outcomes.o1.description
        expect(parseFields(desc).artifacts).toBeUndefined()
      }
    })

    test('propose_edits re-grafts the live conversations onto an updated node', async () => {
      const store = makeStore()
      seed(store)
      const agentEdit: any = {
        outcomes: {
          updated: {
            o1: {
              actionHash: 'o1',
              content: 'Node (refined)',
              // what the agent proposes, built from the STRIPPED view it read
              description: serializeFields({ outcome: 'refined target state' }),
            },
          },
        },
      }
      const res = await handleAcornToolCall(store, PROJECT, {
        tool: 'propose_edits',
        args: { diff: agentEdit },
      })
      expect(res.ok).toBe(true)
      const updated = store.getState().ui.draft.diff!.outcomes.updated['o1']
      const fields = parseFields(updated.description)
      // the agent's edit survives…
      expect(fields.outcome).toBe('refined target state')
      // …and the human's conversation artifact was not dropped
      expect(fields.artifacts).toEqual([convo])
    })
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
