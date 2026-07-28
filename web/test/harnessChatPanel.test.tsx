/**
 * @jest-environment jsdom
 */
/**
 * HarnessChat wiring over the session registry (concurrent-sessions branch) —
 * connect/auto-create, project switching, reload adoption, and hosted-tool
 * routing. The registry's own unit tests (sessionRegistry.test.ts) prove the
 * state machine; the stack contract itself (independent items, per-item Stop,
 * archive) is asserted in harnessChatStack.test.tsx. This file covers the
 * remaining panel-level risk: effect ordering across project switches and
 * reloads, and which session a tool call lands on.
 *
 * Everything below the panel is real (registry, chatHistory, localStorage);
 * only the harness transport is faked (see harnessChatKit).
 */
import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Provider } from 'react-redux'

import { HarnessUpdate } from '../src/harness/types'
import { __resetSessionRegistry } from '../src/harness/sessionRegistry'
import {
  CELL,
  OTHER_CELL,
  FakeSession,
  fakeClient,
  fakeStore,
} from './harnessChatKit'

// --- module seams (must be per test file — jest hoists them) ----------------

jest.mock('../src/components/RichText/RichText', () => ({
  __esModule: true,
  default: ({ source }: { source: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('react').createElement('span', null, source),
}))

let mockClient: any
jest.mock('../src/harness', () => ({
  __esModule: true,
  getHarnessClient: () => mockClient,
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HarnessChat = require('../src/components/HarnessChat/HarnessChat').default

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
  await waitFor(() =>
    expect(screen.getByLabelText('New chat')).not.toBeDisabled()
  )
  return view
}

const ready = async () =>
  waitFor(() => expect(screen.getByLabelText('New chat')).not.toBeDisabled())

/** The stack item whose header title matches (throws when absent). */
const item = (title: string): HTMLElement => {
  const found = [...document.querySelectorAll('.chat-stack-item')].find((el) =>
    (el.querySelector('.chat-item-title')?.textContent || '').includes(title)
  )
  if (!found) throw new Error(`no stack item titled "${title}"`)
  return found as HTMLElement
}

/** Type and send inside one (expanded) item; the turn stays in flight. */
async function sendIn(el: HTMLElement, text: string) {
  fireEvent.change(within(el).getByPlaceholderText('Message this chat…'), {
    target: { value: text },
  })
  await act(async () => {
    fireEvent.click(within(el).getByText('Send'))
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

// --- panel wiring ------------------------------------------------------------

describe('HarnessChat panel wiring', () => {
  it('starts an empty project with one open chat, ready to type into', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    expect(mockClient.sessions.length).toBe(1)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'hello tree')
    expect(a.prompts.length).toBe(1)
    expect(within(item('hello tree')).getByText('Stop')).toBeInTheDocument()
  })

  it('leaves a turn running across a project switch and re-lists it live', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')
    await stream(a, { type: 'message', text: 'before ' })

    // move to another project — the panel swaps to that project's own stack
    // (auto-creating its first chat), while A keeps streaming in the registry
    await act(async () => {
      history.push(`/project/${OTHER_CELL}`)
    })
    await ready()
    expect(screen.queryByText(/before/)).toBeNull()
    expect(mockClient.sessions.length).toBe(2)

    await stream(a, { type: 'message', text: 'during ' })
    await stream(a, { type: 'message', text: 'after' })

    await act(async () => {
      history.push(`/project/${CELL}`)
    })
    await waitFor(() =>
      expect(screen.getByText('before during after')).toBeInTheDocument()
    )
    // re-listing the chat did NOT mint a new session for it — and it is still
    // mid-turn, expanded, with its own Stop
    expect(mockClient.sessions.length).toBe(2)
    expect(within(item('ask A')).getByText('Stop')).toBeInTheDocument()
  })

  it('reattaches a turn the previous renderer left running (reload)', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    const view = await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')
    await stream(a, { type: 'message', text: 'before reload ' })

    // the reload: this renderer and its registry are gone; the sidecar, the
    // agent, and the turn in flight are not
    view.unmount()
    __resetSessionRegistry()
    await openPanel(
      createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    )

    // the chat is back — resumed, not replaced — expanded and showing as
    // still running
    expect(mockClient.sessions.length).toBe(1)
    expect(screen.getByText(/before reload/)).toBeInTheDocument()
    expect(within(item('ask A')).getByText('Stop')).toBeInTheDocument()

    // the rest of the answer lands in the same message as it arrives — not
    // stranded until someone happens to expand this chat
    await stream(a, { type: 'message', text: 'and after' })
    expect(screen.getByText('before reload and after')).toBeInTheDocument()

    // the host's session-addressed end clears it: this renderer never prompted,
    // so there is no prompt promise of its own to resolve
    await act(async () => {
      a.finish()
    })
    expect(within(item('ask A')).getByText('Send')).toBeInTheDocument()
    expect(within(item('ask A')).queryByText('Stop')).toBeNull()
  })

  it("routes tool calls to the CALLING session's project, falling back to last-interacted", async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    let toolHandler: any
    mockClient.onToolCall = (h: any) => {
      toolHandler = h
    }
    await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')

    // A keeps running in the first project while the human moves to another one
    await act(async () => {
      history.push(`/project/${OTHER_CELL}`)
    })
    await ready()
    await sendIn(item('New chat'), 'ask B')

    // attributed to A ⇒ A's project, though "Other tree" is what's on screen
    const attributed = await toolHandler({ tool: 'read_tree', args: {} }, a.id)
    expect(attributed.ok).toBe(true)
    expect(attributed.result.projectMeta.name).toBe('Living spec')

    // unattributed, with two turns in flight ⇒ nothing to infer from, so the
    // chat the human LAST INTERACTED with (B) is the documented fallback
    const unattributed = await toolHandler({ tool: 'read_tree', args: {} })
    expect(unattributed.result.projectMeta.name).toBe('Other tree')
  })
})
