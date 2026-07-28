/**
 * @jest-environment jsdom
 */
/**
 * The always-visible chat stack (multi-chat-panes leaf, stack-only design) —
 * the executable completion criterion: every chat is an item in one stack,
 * each an INDEPENDENT live view over the session registry. Two sessions
 * streaming concurrently update their own items only, each item's input and
 * Stop affect only its own session, collapsing an item never cancels its turn,
 * a chat is archived (never deleted) from its ⋯ menu — restore/delete live in
 * the header's archive view — and the workspace survives a reload.
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
import {
  getSessionRegistry,
  __resetSessionRegistry,
} from '../src/harness/sessionRegistry'
import { saveStore, scopeProject } from '../src/harness/chatHistory'
import { CELL, FakeSession, fakeClient, fakeStore } from './harnessChatKit'

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

/** The stack item whose header title matches (throws when absent). */
const item = (title: string): HTMLElement => {
  const found = [...document.querySelectorAll('.chat-stack-item')].find((el) =>
    (el.querySelector('.chat-item-title')?.textContent || '').includes(title)
  )
  if (!found) throw new Error(`no stack item titled "${title}"`)
  return found as HTMLElement
}
const itemCount = () => document.querySelectorAll('.chat-stack-item').length

/** Type and send inside one (expanded) item; the turn stays in flight. */
async function sendIn(el: HTMLElement, text: string) {
  fireEvent.change(within(el).getByPlaceholderText('Message this chat…'), {
    target: { value: text },
  })
  await act(async () => {
    fireEvent.click(within(el).getByText('Send'))
  })
}

async function newChat() {
  await act(async () => {
    fireEvent.click(screen.getByLabelText('New chat'))
  })
}

/** Open an item's ⋯ menu (if it isn't already) and click a matching entry. */
async function menuClick(el: HTMLElement, entry: RegExp) {
  if (!el.querySelector('.chat-item-menu')) {
    await act(async () => {
      fireEvent.click(within(el).getByLabelText('Chat actions'))
    })
  }
  await act(async () => {
    fireEvent.click(within(el).getByText(entry))
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

// --- the stack contract ------------------------------------------------------

describe('HarnessChat as an always-visible chat stack', () => {
  it('streams two concurrent turns into their own items only', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    // an empty project starts with one chat open and ready
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')

    await newChat()
    const b = mockClient.sessions[1]
    expect(itemCount()).toBe(2)
    await sendIn(item('New chat'), 'ask B')

    // both turns stream at once — each into its own item
    await stream(a, { type: 'message', text: 'alpha' })
    await stream(b, { type: 'message', text: 'beta' })

    expect(within(item('ask A')).getByText('alpha')).toBeInTheDocument()
    expect(within(item('ask A')).queryByText('beta')).toBeNull()
    expect(within(item('ask B')).getByText('beta')).toBeInTheDocument()
    expect(within(item('ask B')).queryByText('alpha')).toBeNull()

    // both keep accumulating live, simultaneously
    await stream(a, { type: 'message', text: ' one' })
    await stream(b, { type: 'message', text: ' two' })
    expect(within(item('ask A')).getByText('alpha one')).toBeInTheDocument()
    expect(within(item('ask B')).getByText('beta two')).toBeInTheDocument()
  })

  it("scopes each item's input, Send and Stop to its own session", async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')
    await newChat()
    const b = mockClient.sessions[1]
    await sendIn(item('New chat'), 'ask B')

    // each item's Stop cancels only its own session
    await act(async () => {
      fireEvent.click(within(item('ask A')).getByText('Stop'))
    })
    expect(a.cancelled).toBe(1)
    expect(b.cancelled).toBe(0)
    await act(async () => {
      fireEvent.click(within(item('ask B')).getByText('Stop'))
    })
    expect(b.cancelled).toBe(1)
    expect(a.cancelled).toBe(1)

    // ...and a follow-up typed into A's input runs on A, not on B
    await act(async () => {
      a.finish()
      b.finish()
    })
    await sendIn(item('ask A'), 'more please')
    expect(a.prompts.length).toBe(2)
    expect(b.prompts.length).toBe(1)
    expect(within(item('ask A')).getByText('more please')).toBeInTheDocument()
  })

  it('never cancels or loses a turn by collapsing its item', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')
    await stream(a, { type: 'message', text: 'partial' })

    await act(async () => {
      fireEvent.click(within(item('ask A')).getByLabelText('Collapse chat'))
    })
    // still in the stack as its own (collapsed) row, with a live dot
    expect(item('ask A').classList.contains('collapsed')).toBe(true)
    expect(item('ask A').querySelector('.chat-live.running')).toBeTruthy()
    expect(a.cancelled).toBe(0)

    // the turn keeps streaming into the registry while collapsed
    await stream(a, { type: 'message', text: ' and the rest' })
    expect(getSessionRegistry().get(a.id)?.busy).toBe(true)

    // re-expanding shows everything that streamed while it was collapsed
    await act(async () => {
      fireEvent.click(within(item('ask A')).getByLabelText('Expand chat'))
    })
    expect(
      within(item('ask A')).getByText('partial and the rest')
    ).toBeInTheDocument()
  })

  it('archives (never deletes) from the item; restore and delete live in the archive view', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')

    // mid-turn, archiving is blocked — the ⋯ menu disables it
    await act(async () => {
      fireEvent.click(within(item('ask A')).getByLabelText('Chat actions'))
    })
    expect(within(item('ask A')).getByText(/Archive chat/)).toBeDisabled()
    await act(async () => {
      a.finish()
    })

    // once idle, Archive moves the chat out of the stack — not into oblivion
    await menuClick(item('ask A'), /Archive chat/)
    expect(itemCount()).toBe(0)
    expect(a.cancelled).toBe(0)

    // the archive view lists it; restore puts it back in the stack
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Archived chats')) // open
    })
    expect(screen.getByText('ask A')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Restore chat'))
    })
    expect(item('ask A')).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Archived chats')) // close
    })

    // delete exists ONLY in the archive view, behind the archive step
    await menuClick(item('ask A'), /Archive chat/)
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Archived chats')) // reopen
    })
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Delete chat'))
    })
    expect(screen.getByText('No archived chats')).toBeInTheDocument()
    expect(itemCount()).toBe(0)
  })

  it('restores the workspace (rows + expanded set) after a reload', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    const view = await openPanel(history)
    const [a] = mockClient.sessions
    await sendIn(item('New chat'), 'ask A')
    await act(async () => {
      a.finish()
    })

    // the reload: renderer and registry are gone; the host and its sessions are not
    view.unmount()
    __resetSessionRegistry()
    await openPanel(
      createMemoryHistory({ initialEntries: [`/project/${CELL}`] })
    )

    // the chat is back as an EXPANDED item over the resumed session — with its
    // transcript, and without minting a new session
    const transcript = item('ask A').querySelector(
      '.chat-item-transcript'
    ) as HTMLElement
    expect(within(transcript).getByText('ask A')).toBeInTheDocument()
    expect(mockClient.sessions.length).toBe(1)
  })

  it("lists another agent's chats read-only, in the same stack", async () => {
    // a chat stored under a different backend, from some earlier attach
    saveStore(scopeProject(CELL, 'legacy-agent'), {
      currentId: 'X1',
      sessions: [
        {
          id: 'X1',
          title: 'old foreign chat',
          updatedAt: Date.now(),
          messages: [
            { id: 1, role: 'user', text: 'old foreign chat' },
            { id: 2, role: 'agent', text: 'foreign reply' },
          ],
          agentName: 'legacy-agent',
        },
      ],
    })
    const history = createMemoryHistory({
      initialEntries: [`/project/${CELL}`],
    })
    await openPanel(history)

    const foreign = item('old foreign chat')
    expect(within(foreign).getByText('legacy-agent')).toBeInTheDocument() // agent chip
    await act(async () => {
      fireEvent.click(within(foreign).getByLabelText('Expand chat'))
    })
    // readable, never writable here — and no session was minted for it
    expect(within(foreign).getByText('foreign reply')).toBeInTheDocument()
    expect(
      within(foreign).queryByPlaceholderText('Message this chat…')
    ).toBeNull()
    expect(within(foreign).getByText(/Read-only/)).toBeInTheDocument()
  })
})
