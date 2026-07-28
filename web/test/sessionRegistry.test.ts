/**
 * SessionRegistry — the concurrent-sessions core (leaf: session-registry).
 * Exercises the concurrency contract against fake HarnessSessions: several
 * sessions stream turns at once into their OWN entries, persistence is always
 * coherent per (chatKey, sessionId), and a running turn is never disturbed by
 * registry operations around it.
 */
import { SessionRegistry } from '../src/harness/sessionRegistry'
import {
  HarnessSession,
  HarnessStopReason,
  HarnessUpdate,
} from '../src/harness/types'

function fakeSession(id: string, opts: { canAdopt?: boolean } = {}) {
  const subs = new Set<(u: HarnessUpdate) => void>()
  const turnEndSubs = new Set<(r: { stopReason: HarnessStopReason }) => void>()
  let resolveTurn: ((r: { stopReason: HarnessStopReason }) => void) | null = null
  let rejectTurn: ((e: Error) => void) | null = null
  const session: HarnessSession = {
    id,
    prompt: () =>
      new Promise((res, rej) => {
        resolveTurn = res
        rejectTurn = rej
      }),
    cancel: () => {},
    on: (_event, cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    // a provider that can't report a foreign turn's end omits this (opts)
    ...(opts.canAdopt === false
      ? {}
      : {
          onTurnEnd: (cb: (r: { stopReason: HarnessStopReason }) => void) => {
            turnEndSubs.add(cb)
            return () => turnEndSubs.delete(cb)
          },
        }),
    dispose: async () => {},
  }
  return {
    session,
    emit: (u: HarnessUpdate) => subs.forEach((cb) => cb(u)),
    end: (stopReason: HarnessStopReason = 'end_turn') =>
      resolveTurn!({ stopReason }),
    /** the host announcing the end of a turn we didn't start */
    endFromHost: (stopReason: HarnessStopReason = 'end_turn') =>
      [...turnEndSubs].forEach((cb) => cb({ stopReason })),
    fail: (msg: string) => rejectTurn!(new Error(msg)),
    subscriberCount: () => subs.size,
    turnEndSubscriberCount: () => turnEndSubs.size,
  }
}

const makeRegistry = () => {
  const persist = jest.fn()
  let t = 1000
  const registry = new SessionRegistry({ persist, now: () => ++t })
  return { registry, persist }
}

const openOn = (
  registry: SessionRegistry,
  fake: ReturnType<typeof fakeSession>,
  projectId = 'projA'
) =>
  registry.open({
    id: fake.session.id,
    projectId,
    chatKey: `${projectId}::agent`,
    agentName: 'agent',
    session: fake.session,
  })

describe('SessionRegistry', () => {
  it('streams two concurrent turns into their own entries', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    const b = fakeSession('B')
    openOn(registry, a)
    openOn(registry, b, 'projB')

    const turnA = registry.runTurn('A', [{ type: 'text', text: 'hi A' }])
    const turnB = registry.runTurn('B', [{ type: 'text', text: 'hi B' }])
    expect(registry.get('A')!.busy).toBe(true)
    expect(registry.get('B')!.busy).toBe(true)

    // interleaved streaming lands on the right transcripts
    a.emit({ type: 'message', text: 'alpha ' })
    b.emit({ type: 'message', text: 'beta ' })
    a.emit({ type: 'message', text: 'one' })
    b.emit({ type: 'message', text: 'two' })
    b.end()
    await turnB
    expect(registry.get('B')!.busy).toBe(false)
    // ending B's turn leaves A's turn untouched and still streaming
    expect(registry.get('A')!.busy).toBe(true)
    a.emit({ type: 'message', text: '!' })
    a.end()
    await turnA

    const textOf = (id: string) =>
      registry
        .get(id)!
        .messages.filter((m) => m.role === 'agent')
        .map((m) => m.text)
        .join('')
    expect(textOf('A')).toBe('alpha one!')
    expect(textOf('B')).toBe('beta two')
  })

  it('persists every mutation under the entry\'s own chatKey + id, preserving the current pointer', async () => {
    const { registry, persist } = makeRegistry()
    const a = fakeSession('A')
    const b = fakeSession('B')
    openOn(registry, a, 'projA')
    openOn(registry, b, 'projB')

    registry.appendMessage('A', 'user', 'to A')
    registry.appendMessage('B', 'user', 'to B')

    const keysFor = (id: string) =>
      persist.mock.calls.filter((c) => c[1] === id).map((c) => c[0])
    expect(keysFor('A')).toEqual(['projA::agent'])
    expect(keysFor('B')).toEqual(['projB::agent'])
    // a background persist must not steal the "current chat" pointer
    for (const call of persist.mock.calls) expect(call[6]).toBe(true)
    // and the payload is always the OWNING entry's transcript
    const lastB = persist.mock.calls.filter((c) => c[1] === 'B').pop()!
    expect(lastB[2].map((m: any) => m.text)).toEqual(['to B'])
  })

  it('soleBusy identifies the unambiguous busy session, and only that', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    const b = fakeSession('B')
    openOn(registry, a)
    openOn(registry, b)
    expect(registry.soleBusy()).toBeUndefined()

    const turnA = registry.runTurn('A', [])
    expect(registry.soleBusy()!.id).toBe('A')

    const turnB = registry.runTurn('B', [])
    expect(registry.soleBusy()).toBeUndefined() // two busy = ambiguous

    a.end()
    await turnA
    expect(registry.soleBusy()!.id).toBe('B')
    b.end()
    await turnB
  })

  it('surfaces a turn error on the transcript instead of throwing, and clears busy', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [])
    a.fail('boom')
    await turn
    const e = registry.get('A')!
    expect(e.busy).toBe(false)
    expect(e.messages[e.messages.length - 1].text).toContain('boom')
  })

  it('marks a refusal and unsubscribes the update listener after the turn', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [])
    a.end('refusal')
    await turn
    const e = registry.get('A')!
    expect(e.messages[e.messages.length - 1].text).toBe('(the agent declined)')
    expect(a.subscriberCount()).toBe(0)
  })

  it('drops a consolidated duplicate of the whole streamed answer', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [])
    a.emit({ type: 'message', text: 'hello ' })
    a.emit({ type: 'message', text: 'world' })
    a.emit({ type: 'message', text: 'hello world' }) // gateway re-delivery
    a.end()
    await turn
    const agentMsgs = registry.get('A')!.messages.filter((m) => m.role === 'agent')
    expect(agentMsgs[agentMsgs.length - 1].text).toBe('hello world')
  })

  it('accumulates thinking, plan snapshots, and tool calls on the streaming turn', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [])
    a.emit({ type: 'thought', text: 'hmm ' })
    a.emit({ type: 'thought', text: 'ok' })
    a.emit({
      type: 'plan',
      entries: [{ content: 'step 1', priority: 'high', status: 'pending' }],
    })
    a.emit({
      type: 'tool_call',
      toolCallId: 't1',
      title: 'read_tree',
      status: 'pending',
    })
    a.emit({
      type: 'tool_call',
      toolCallId: 't1',
      title: 'read_tree',
      status: 'completed',
    })
    a.end()
    await turn
    const e = registry.get('A')!
    const msg = e.messages[e.messages.length - 1]
    expect(msg.thinking).toBe('hmm ok')
    expect(e.plan).toHaveLength(1)
    expect(e.planSnapshots).toHaveLength(1)
    expect(msg.toolCalls).toEqual([
      { id: 't1', title: 'read_tree', status: 'completed' },
    ])
  })

  it('re-opening a live id returns the existing entry untouched', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    const first = openOn(registry, a)
    registry.appendMessage('A', 'user', 'kept')
    const again = openOn(registry, a)
    expect(again).toBe(first)
    expect(again.messages.map((m) => m.text)).toEqual(['kept'])
  })

  it('refuses to remove a mid-turn entry; removes it once idle', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [])
    registry.remove('A')
    expect(registry.get('A')).toBeDefined() // still streaming
    a.end()
    await turn
    registry.remove('A')
    expect(registry.get('A')).toBeUndefined()
  })

  it('restores a stored transcript and continues message ids after it', () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    registry.open({
      id: 'A',
      projectId: 'projA',
      chatKey: 'projA::agent',
      agentName: 'agent',
      session: a.session,
      messages: [
        { id: 7, role: 'user', text: 'earlier' },
        { id: 9, role: 'agent', text: 'reply' },
      ],
    })
    const newId = registry.appendMessage('A', 'user', 'later')
    expect(newId).toBe(10)
  })

  it('tracks the tree snapshot last sent per session', () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    expect(registry.lastTree('A')).toBeNull()
    const snap = { outcomes: {} }
    registry.markTreeSent('A', snap)
    expect(registry.lastTree('A')).toBe(snap)
    registry.clearTreeSent('A')
    expect(registry.lastTree('A')).toBeNull()
  })

  // --- adopting a turn started before a reload ---

  it('adopts a host-side turn, continuing the transcript it left mid-answer', () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    // what the store held when the renderer went away: an answer in progress
    registry.open({
      id: 'A',
      projectId: 'projA',
      chatKey: 'projA::agent',
      agentName: 'agent',
      session: a.session,
      messages: [
        { id: 1, role: 'user', text: 'ask', at: 1 },
        { id: 2, role: 'agent', text: 'half an ans', at: 2 },
      ],
    })
    expect(registry.adoptTurn('A')).toBe(true)
    expect(registry.get('A')!.busy).toBe(true)
    // no second agent bubble — the same message keeps filling
    expect(registry.get('A')!.messages.length).toBe(2)

    a.emit({ type: 'message', text: 'wer' })
    const messages = registry.get('A')!.messages
    expect(messages.length).toBe(2)
    expect(messages[1].text).toBe('half an answer')

    a.endFromHost()
    expect(registry.get('A')!.busy).toBe(false)
    expect(a.subscriberCount()).toBe(0) // update listener released
    expect(a.turnEndSubscriberCount()).toBe(0)
  })

  it('opens a fresh agent message when the restored transcript ends on the human', () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    registry.open({
      id: 'A',
      projectId: 'projA',
      chatKey: 'projA::agent',
      agentName: 'agent',
      session: a.session,
      messages: [{ id: 1, role: 'user', text: 'ask', at: 1 }],
    })
    registry.adoptTurn('A')
    a.emit({ type: 'message', text: 'answering now' })
    const messages = registry.get('A')!.messages
    expect(messages.length).toBe(2)
    expect(messages[1]).toMatchObject({ role: 'agent', text: 'answering now' })
  })

  it('refuses to adopt when the turn is already running here, or cannot be adopted', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    const turn = registry.runTurn('A', [{ type: 'text', text: 'hi' }])
    // ours already — adopting again would double-subscribe the stream
    expect(registry.adoptTurn('A')).toBe(false)
    a.end()
    await turn

    // a provider with no way to report a foreign turn's end: adopt nothing
    // rather than leave the entry busy forever
    const b = fakeSession('B', { canAdopt: false })
    openOn(registry, b)
    expect(registry.adoptTurn('B')).toBe(false)
    expect(registry.get('B')!.busy).toBe(false)
    expect(registry.adoptTurn('missing')).toBe(false)
  })

  it('notifies subscribers on changes from any session', async () => {
    const { registry } = makeRegistry()
    const a = fakeSession('A')
    openOn(registry, a)
    let ticks = 0
    const unsub = registry.subscribe(() => ticks++)
    registry.appendMessage('A', 'user', 'x')
    expect(ticks).toBeGreaterThan(0)
    const before = ticks
    unsub()
    registry.appendMessage('A', 'user', 'y')
    expect(ticks).toBe(before)
  })
})
