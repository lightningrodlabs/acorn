/**
 * @jest-environment jsdom
 */
/**
 * HarnessChat as a VIEW over the session registry (concurrent-sessions branch,
 * leaf: session-registry) — the panel rewrite's regression net.
 *
 * The registry's own unit tests (sessionRegistry.test.ts) prove the state
 * machine; they cannot prove the WIRING, which is where this rewrite's risk
 * lives: effect ordering, what a render derives from the registry versus its own
 * state, and which session an action lands on. Those failures are invisible in
 * live dogfooding — a background turn that silently stops streaming looks
 * exactly like a slow agent — so they get asserted here instead.
 *
 * Everything below the panel is real (registry, chatHistory, localStorage); only
 * the harness transport is faked, so a turn's timing is under the test's control.
 */
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Provider } from 'react-redux'

import {
  HarnessContentBlock,
  HarnessSession,
  HarnessStopReason,
  HarnessUpdate,
} from '../src/harness/types'
import { __resetSessionRegistry } from '../src/harness/sessionRegistry'

// --- module seams -----------------------------------------------------------

// The markdown renderer pulls in ESM-only react-markdown; the panel only needs
// it to put message text on screen.
jest.mock('../src/components/RichText/RichText', () => ({
  __esModule: true,
  default: ({ source }: { source: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('react').createElement('span', null, source),
}))

// The transport. `getHarnessClient` is a module-level singleton in the app; here
// it hands back whatever the current test built.
let mockClient: any
jest.mock('../src/harness', () => ({
  __esModule: true,
  getHarnessClient: () => mockClient,
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HarnessChat = require('../src/components/HarnessChat/HarnessChat').default

// --- fakes ------------------------------------------------------------------

/** A HarnessSession whose turn ends only when the test says so. */
class FakeSession implements HarnessSession {
  readonly id: string
  readonly prompts: HarnessContentBlock[][] = []
  cancelled = 0
  private subs = new Set<(u: HarnessUpdate) => void>()
  private turnEndSubs = new Set<(r: { stopReason: HarnessStopReason }) => void>()
  private finishTurn: ((r: { stopReason: HarnessStopReason }) => void) | null =
    null

  constructor(id: string) {
    this.id = id
  }
  prompt(blocks: HarnessContentBlock[]) {
    this.prompts.push(blocks)
    return new Promise<{ stopReason: HarnessStopReason }>((res) => {
      this.finishTurn = res
    })
  }
  cancel() {
    this.cancelled++
  }
  on(_event: 'update', cb: (u: HarnessUpdate) => void) {
    this.subs.add(cb)
    return () => this.subs.delete(cb)
  }
  onTurnEnd(cb: (r: { stopReason: HarnessStopReason }) => void) {
    this.turnEndSubs.add(cb)
    return () => this.turnEndSubs.delete(cb)
  }
  async dispose() {}

  /** stream an update into whatever is listening (the registry's turn) */
  emit(u: HarnessUpdate) {
    for (const cb of [...this.subs]) cb(u)
  }
  /** the host's two announcements: to the prompter, and to any adopter */
  finish(stopReason: HarnessStopReason = 'end_turn') {
    this.finishTurn?.({ stopReason })
    this.finishTurn = null
    for (const cb of [...this.turnEndSubs]) cb({ stopReason })
  }
  get inFlight() {
    return this.finishTurn !== null
  }
}

function fakeClient() {
  const sessions: FakeSession[] = []
  return {
    sessions,
    available: true,
    initialize: async () => ({
      protocolVersion: 1,
      agentName: 'test-agent',
      mcpServers: [],
    }),
    newSession: async () => {
      const s = new FakeSession(`S${sessions.length + 1}`)
      sessions.push(s)
      return s
    },
    // the host has no session to reattach to in these tests; openSession then
    // starts a fresh one, as it does against a restarted sidecar
    resumeSession: async (id: string) => {
      const live = sessions.find((s) => s.id === id)
      if (live) return live
      throw new Error('no such session')
    },
    // what a surviving sidecar reports on connect (see reattachInFlight)
    listSessions: async () =>
      sessions.map((s) => ({ sessionId: s.id, inFlight: s.inFlight })),
    onPermissionRequest: () => {},
    onToolCall: () => {},
  }
}

const CELL = 'cellOne'
const OTHER_CELL = 'cellTwo'

const projectCollections = (name: string) => ({
  projectMeta: { name, actionHash: `pm-${name}` },
  outcomes: { o1: { content: 'root outcome' } },
  connections: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
  tags: {},
})

/** Minimal store: the panel reads the selection reactively and the project
 *  collections through readTree/readSelection, and dispatches keyboard focus. */
function fakeStore() {
  const one = projectCollections('Living spec')
  const two = projectCollections('Other tree')
  const state: any = {
    ui: { selection: { selectedOutcomes: [] } },
    projects: {
      projectMeta: { [CELL]: one.projectMeta, [OTHER_CELL]: two.projectMeta },
      outcomes: { [CELL]: one.outcomes, [OTHER_CELL]: two.outcomes },
      connections: { [CELL]: {}, [OTHER_CELL]: {} },
      outcomeMembers: { [CELL]: {}, [OTHER_CELL]: {} },
      outcomeComments: { [CELL]: {}, [OTHER_CELL]: {} },
      entryPoints: { [CELL]: {}, [OTHER_CELL]: {} },
      tags: { [CELL]: {}, [OTHER_CELL]: {} },
    },
  }
  return {
    getState: () => state,
    dispatch: (a: any) => a,
    subscribe: () => () => {},
    replaceReducer: () => {},
  }
}

// --- harness ----------------------------------------------------------------

async function openPanel(history: MemoryHistory) {
  const store = fakeStore()
  const view = render(
    <Provider store={store as any}>
      <Router history={history}>
        <HarnessChat />
      </Router>
    </Provider>
  )
  await act(async () => {
    fireEvent.click(screen.getByText('Chat with tree'))
  })
  // connect() resolves initialize + the first session before the panel is ready
  await waitFor(() =>
    expect(screen.getByLabelText('Chat history')).not.toBeDisabled()
  )
  return view
}

const textarea = () =>
  screen.getByPlaceholderText('Ask about the tree…') as HTMLTextAreaElement

/** Type and send; the turn is left in flight (the fake resolves on finish()). */
async function send(text: string) {
  fireEvent.change(textarea(), { target: { value: text } })
  await act(async () => {
    fireEvent.click(screen.getByText('Send'))
  })
}

/** Open the history dropdown and click the row whose title matches. */
async function pick(title: string) {
  await act(async () => {
    fireEvent.click(screen.getByLabelText('Chat history'))
  })
  const row = screen
    .getAllByTitle(title, { exact: false })
    .find((el) => el.classList.contains('hist-pick'))
  if (!row) throw new Error(`no history row titled "${title}"`)
  await act(async () => {
    fireEvent.click(row)
  })
}

async function newChat() {
  await act(async () => {
    fireEvent.click(screen.getByLabelText('Chat history'))
  })
  await act(async () => {
    fireEvent.click(screen.getByText(/New chat/))
  })
}

const stream = async (s: FakeSession, u: HarnessUpdate) => {
  await act(async () => {
    s.emit(u)
  })
}

beforeEach(() => {
  localStorage.clear()
  __resetSessionRegistry()
  mockClient = fakeClient()
})

// --- the concurrency contract, as seen through the panel --------------------

describe('HarnessChat over the session registry', () => {
  it('keeps a background turn streaming while another session is displayed', async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    await openPanel(history)
    const [a] = mockClient.sessions

    await send('ask A')
    await stream(a, { type: 'message', text: 'alpha ' })

    // switch to a second chat while A's turn is still in flight
    await newChat()
    const b = mockClient.sessions[1]
    expect(b).toBeDefined()
    expect(screen.queryByText(/alpha/)).toBeNull() // B's transcript, not A's

    await send('ask B')
    await stream(b, { type: 'message', text: 'beta reply' })
    // A is still running in the background, and still receiving
    await stream(a, { type: 'message', text: 'one' })
    await act(async () => {
      a.finish()
    })

    expect(screen.getByText('beta reply')).toBeInTheDocument()

    await pick('ask A')
    // A's output accumulated in full while it was off screen
    expect(screen.getByText('alpha one')).toBeInTheDocument()
    expect(screen.queryByText('beta reply')).toBeNull()
  })

  it('shows a live status dot for a session running in the background', async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    const { container } = await openPanel(history)
    const [a] = mockClient.sessions

    await send('ask A')
    await stream(a, { type: 'message', text: 'working' })
    await newChat()

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Chat history'))
    })
    const row = screen
      .getAllByTitle('ask A', { exact: false })
      .find((el) => el.classList.contains('hist-pick'))!
    expect(row.querySelector('.hist-live.running')).toBeTruthy()
    // the displayed (idle) chat carries no dot
    expect(container.querySelectorAll('.hist-live').length).toBe(1)

    await act(async () => {
      a.finish()
    })
    expect(container.querySelector('.hist-live')).toBeNull()
  })

  it('cancels only the displayed session', async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    await openPanel(history)
    const [a] = mockClient.sessions

    await send('ask A')
    await newChat()
    const b = mockClient.sessions[1]
    await send('ask B')

    // both in flight; Stop belongs to the displayed chat (B)
    await act(async () => {
      fireEvent.click(screen.getByText('Stop'))
    })
    expect(b.cancelled).toBe(1)
    expect(a.cancelled).toBe(0)
  })

  it('leaves a turn running across a project switch and re-displays it live', async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    await openPanel(history)
    const [a] = mockClient.sessions

    await send('ask A')
    await stream(a, { type: 'message', text: 'before ' })

    // move to another project — the panel resets and connects to that project's
    // own chat, while A keeps streaming in the registry
    await act(async () => {
      history.push(`/project/${OTHER_CELL}`)
    })
    await waitFor(() =>
      expect(screen.getByLabelText('Chat history')).not.toBeDisabled()
    )
    expect(screen.queryByText(/before/)).toBeNull()
    expect(mockClient.sessions.length).toBe(2) // a fresh session for the other project

    await stream(a, { type: 'message', text: 'during ' })
    await stream(a, { type: 'message', text: 'after' })

    await act(async () => {
      history.push(`/project/${CELL}`)
    })
    await waitFor(() =>
      expect(screen.getByText('before during after')).toBeInTheDocument()
    )
    // reattaching the displayed chat did NOT mint a new session for it
    expect(mockClient.sessions.length).toBe(2)
  })

  it('reattaches a turn the previous renderer left running (reload)', async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    const view = await openPanel(history)
    const [a] = mockClient.sessions

    await send('ask A')
    await stream(a, { type: 'message', text: 'before reload ' })

    // the reload: this renderer and its registry are gone; the sidecar, the
    // agent, and the turn in flight are not
    view.unmount()
    __resetSessionRegistry()
    await openPanel(
      createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    )

    // the stored transcript is back, the session was resumed rather than
    // replaced, and the turn is showing as still running
    expect(mockClient.sessions.length).toBe(1)
    expect(screen.getByText(/before reload/)).toBeInTheDocument()
    expect(screen.getByText('Stop')).toBeInTheDocument()

    // the rest of the answer lands in the same message as it arrives — not
    // stranded until someone clicks this chat
    await stream(a, { type: 'message', text: 'and after' })
    expect(screen.getByText('before reload and after')).toBeInTheDocument()

    // the host's session-addressed end clears it: this renderer never prompted,
    // so there is no prompt promise of its own to resolve
    await act(async () => {
      a.finish()
    })
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.queryByText('Stop')).toBeNull()
  })

  it("reads the CALLING session's project, not the displayed one", async () => {
    const history = createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    let toolHandler: any
    mockClient.onToolCall = (h: any) => {
      toolHandler = h
    }
    await openPanel(history)
    const [a] = mockClient.sessions
    await send('ask A')

    // A keeps running in the first project while the human moves to another one
    await act(async () => {
      history.push(`/project/${OTHER_CELL}`)
    })
    await waitFor(() =>
      expect(screen.getByLabelText('Chat history')).not.toBeDisabled()
    )
    await send('ask B')

    // attributed to A ⇒ A's project, though "Other tree" is what's on screen
    const attributed = await toolHandler({ tool: 'read_tree', args: {} }, a.id)
    expect(attributed.ok).toBe(true)
    expect(attributed.result.projectMeta.name).toBe('Living spec')

    // unattributed, with two turns in flight ⇒ nothing to infer from, so the
    // displayed project is the documented fallback
    const unattributed = await toolHandler({ tool: 'read_tree', args: {} })
    expect(unattributed.result.projectMeta.name).toBe('Other tree')
  })
})
