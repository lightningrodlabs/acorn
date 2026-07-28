/**
 * The concurrency contract at the TRANSPORT seam: a fake sidecar socket ↔
 * DevSidecarHarnessClient ↔ SessionRegistry, with two turns in flight over one
 * connection (concurrent-sessions branch, leaf: session-registry).
 *
 * Division of labour with the other suites:
 *   - sessionRegistry.test.ts — the registry's state machine, against fake sessions
 *   - harnessChatPanel.test.tsx — the panel's wiring and ROUTING decisions
 *   - here — that frames off one socket reach the right session: multiplexing,
 *     reply correlation, and per-session failure isolation. Everything between
 *     the socket and the transcript is real.
 *
 * These are the failures that look like "the agent is being slow" in live use:
 * an update delivered to the wrong subscriber, a turnEnd resolving somebody
 * else's prompt, one session's error killing every in-flight turn.
 */
import { DevSidecarHarnessClient } from '../src/harness/devSidecarClient'
import { SessionRegistry } from '../src/harness/sessionRegistry'
import { ClientFrame, ServerFrame } from '../src/harness/protocol'
import {
  HarnessPermissionRequest,
  HarnessStopReason,
  HarnessToolCall,
  HarnessUpdate,
} from '../src/harness/types'

// --- a sidecar the test drives ----------------------------------------------

/**
 * Stands in for the dev-server sidecar: answers the request/reply frames the
 * way sidecar.js does, and leaves every prompt OPEN until the test ends it, so
 * "two turns in flight" is a state the test can hold and inspect.
 */
class FakeSidecar {
  socket: FakeSocket | null = null
  /** prompt frame ids awaiting a turnEnd, oldest first, per session */
  private openPrompts = new Map<string, number[]>()
  private nextSession = 1
  private nextRequestId = 1
  private awaitingRenderer = new Map<number, (frame: ClientFrame) => void>()
  /** sessions the host currently holds (survives a renderer reload) */
  readonly held = new Set<string>()
  /** sessions the sidecar has forgotten (a restarted agent) — resume fails */
  readonly lost = new Set<string>()
  readonly cancels: string[] = []
  readonly prompted: Array<{ sessionId: string; blocks: unknown[] }> = []

  attach(socket: FakeSocket) {
    this.socket = socket
    socket.onClientFrame = (frame) => this.handle(frame)
  }

  private send(frame: ServerFrame) {
    this.socket?.deliver(JSON.stringify(frame))
  }

  private handle(frame: ClientFrame) {
    switch (frame.t) {
      case 'initialize':
        return this.send({
          t: 'initialized',
          id: frame.id,
          info: { protocolVersion: 1, agentName: 'fake-agent' },
        })
      case 'newSession': {
        const sessionId = `S${this.nextSession++}`
        this.held.add(sessionId)
        return this.send({ t: 'sessionCreated', id: frame.id, sessionId })
      }
      case 'sessions':
        return this.send({
          t: 'sessionList',
          id: frame.id,
          sessions: [...this.held].map((sessionId) => ({
            sessionId,
            inFlight: (this.openPrompts.get(sessionId) || []).length > 0,
          })),
        })
      case 'resumeSession':
        return this.lost.has(frame.sessionId)
          ? this.send({ t: 'sessionResumeFailed', id: frame.id })
          : this.send({
              t: 'sessionResumed',
              id: frame.id,
              sessionId: frame.sessionId,
            })
      case 'prompt': {
        this.prompted.push({ sessionId: frame.sessionId, blocks: frame.blocks })
        const queue = this.openPrompts.get(frame.sessionId) || []
        queue.push(frame.id)
        this.openPrompts.set(frame.sessionId, queue)
        return // deliberately unanswered: the turn is now in flight
      }
      case 'cancel':
        return void this.cancels.push(frame.sessionId)
      case 'toolResult':
      case 'permissionDecision': {
        const waiter = this.awaitingRenderer.get(frame.requestId)
        this.awaitingRenderer.delete(frame.requestId)
        return void waiter?.(frame)
      }
    }
  }

  private takePrompt(sessionId: string): number {
    const queue = this.openPrompts.get(sessionId)
    if (!queue || !queue.length)
      throw new Error(`no turn in flight for ${sessionId}`)
    return queue.shift() as number
  }

  // --- what the test drives ---

  update(sessionId: string, update: HarnessUpdate) {
    this.send({ t: 'update', sessionId, update })
  }
  /** Both announcements the sidecar makes: correlated by prompt id (for the
   *  renderer that sent it) AND addressed by session (for one that adopted it). */
  endTurn(sessionId: string, stopReason: HarnessStopReason = 'end_turn') {
    this.send({ t: 'turnEnd', id: this.takePrompt(sessionId), stopReason })
    this.send({ t: 'turnEnded', sessionId, stopReason })
  }
  /** the sidecar's agent-exited path: an error frame per in-flight prompt */
  failTurn(sessionId: string, message: string) {
    this.send({ t: 'error', id: this.takePrompt(sessionId), message })
    this.send({ t: 'turnEnded', sessionId, stopReason: 'cancelled' })
  }
  /** push a hosted tool call; resolves with the renderer's reply frame */
  toolCall(call: HarnessToolCall, sessionId?: string): Promise<any> {
    const requestId = this.nextRequestId++
    const reply = new Promise<any>((res) =>
      this.awaitingRenderer.set(requestId, res)
    )
    this.send({ t: 'toolCall', requestId, sessionId, call })
    return reply
  }
  permissionRequest(
    sessionId: string,
    request: HarnessPermissionRequest
  ): Promise<any> {
    const requestId = this.nextRequestId++
    const reply = new Promise<any>((res) =>
      this.awaitingRenderer.set(requestId, res)
    )
    this.send({ t: 'permissionRequest', requestId, sessionId, request })
    return reply
  }
}

/** The WebSocket surface DevSidecarHarnessClient actually touches. */
class FakeSocket {
  static OPEN = 1
  static current: FakeSocket | null = null
  readyState = FakeSocket.OPEN
  onopen: (() => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null
  onClientFrame: ((frame: ClientFrame) => void) | null = null

  constructor(_url: string) {
    FakeSocket.current = this
    // open on a later tick: the client assigns its handlers after constructing
    setTimeout(() => this.onopen?.(), 0)
  }
  send(raw: string) {
    this.onClientFrame?.(JSON.parse(raw))
  }
  /** sidecar → renderer */
  deliver(raw: string) {
    this.onmessage?.({ data: raw })
  }
  close() {
    this.readyState = 3
    this.onclose?.()
  }
}

// --- fixture ----------------------------------------------------------------

const g = globalThis as any
g.location = { protocol: 'http:', host: 'localhost:8888' }
g.WebSocket = FakeSocket

/** Two live sessions, both mid-turn, over one connection. */
async function twoTurnsInFlight() {
  const sidecar = new FakeSidecar()
  const client = new DevSidecarHarnessClient()
  const persisted: Array<{ chatKey: string; id: string; texts: string[] }> = []
  const registry = new SessionRegistry({
    persist: ((chatKey: string, id: string, messages: any[]) => {
      persisted.push({ chatKey, id, texts: messages.map((m) => m.text) })
    }) as any,
    now: () => 1_000,
  })

  // the client constructs its socket inside initialize()
  const ready = client.initialize()
  await Promise.resolve()
  sidecar.attach(FakeSocket.current as FakeSocket)
  const info = await ready

  const a = await client.newSession({})
  const b = await client.newSession({})
  registry.open({
    id: a.id,
    projectId: 'projectOne',
    chatKey: 'projectOne::fake-agent',
    agentName: 'fake-agent',
    session: a,
  })
  registry.open({
    id: b.id,
    projectId: 'projectTwo',
    chatKey: 'projectTwo::fake-agent',
    agentName: 'fake-agent',
    session: b,
  })
  const turnA = registry.runTurn(a.id, [{ type: 'text', text: 'ask A' }])
  const turnB = registry.runTurn(b.id, [{ type: 'text', text: 'ask B' }])
  await Promise.resolve()

  const text = (id: string) =>
    registry
      .get(id)!
      .messages.filter((m) => m.role === 'agent')
      .map((m) => m.text)
      .join('')

  return { sidecar, client, registry, info, a, b, turnA, turnB, persisted, text }
}

// --- the contract -----------------------------------------------------------

describe('two turns in flight over one sidecar connection', () => {
  it('delivers each session updates only to its own transcript', async () => {
    const { sidecar, a, b, text, turnA, turnB } = await twoTurnsInFlight()

    sidecar.update(a.id, { type: 'message', text: 'alpha ' })
    sidecar.update(b.id, { type: 'message', text: 'beta ' })
    sidecar.update(a.id, { type: 'message', text: 'one' })
    sidecar.update(b.id, { type: 'message', text: 'two' })

    expect(text(a.id)).toBe('alpha one')
    expect(text(b.id)).toBe('beta two')

    sidecar.endTurn(a.id)
    sidecar.endTurn(b.id)
    await Promise.all([turnA, turnB])
  })

  it('resolves each prompt on its OWN turnEnd, by frame correlation', async () => {
    const { sidecar, registry, a, b, turnA, turnB } = await twoTurnsInFlight()
    let aDone = false
    let bDone = false
    turnA.then(() => (aDone = true))
    turnB.then(() => (bDone = true))

    sidecar.endTurn(b.id)
    await turnB
    expect(bDone).toBe(true)
    expect(aDone).toBe(false)
    expect(registry.get(a.id)!.busy).toBe(true)
    expect(registry.get(b.id)!.busy).toBe(false)

    sidecar.endTurn(a.id)
    await turnA
    expect(registry.get(a.id)!.busy).toBe(false)
  })

  it('confines a failed turn to its own session', async () => {
    const { sidecar, registry, a, b, text, turnA, turnB } =
      await twoTurnsInFlight()

    sidecar.update(b.id, { type: 'message', text: 'still fine' })
    sidecar.failTurn(a.id, 'agent process exited (code 1)')
    await turnA

    expect(text(a.id)).toContain('agent process exited')
    expect(registry.get(a.id)!.busy).toBe(false)
    // B never noticed
    expect(registry.get(b.id)!.busy).toBe(true)
    expect(text(b.id)).toBe('still fine')

    sidecar.update(b.id, { type: 'message', text: ' and finishing' })
    sidecar.endTurn(b.id)
    await turnB
    expect(text(b.id)).toBe('still fine and finishing')
  })

  it("persists each session's transcript under its own chatKey and id", async () => {
    const { sidecar, a, b, persisted, turnA, turnB } = await twoTurnsInFlight()

    sidecar.update(a.id, { type: 'message', text: 'alpha' })
    sidecar.update(b.id, { type: 'message', text: 'beta' })
    sidecar.endTurn(a.id)
    sidecar.endTurn(b.id)
    await Promise.all([turnA, turnB])

    // no write ever carries one session's text under the other's identity
    for (const write of persisted) {
      const foreign = write.id === a.id ? 'beta' : 'alpha'
      expect(write.texts.join('')).not.toContain(foreign)
      expect(write.chatKey).toBe(
        write.id === a.id ? 'projectOne::fake-agent' : 'projectTwo::fake-agent'
      )
    }
    expect(persisted.some((w) => w.id === a.id)).toBe(true)
    expect(persisted.some((w) => w.id === b.id)).toBe(true)
  })

  it('cancels only the session asked for', async () => {
    const { sidecar, a, b, turnA, turnB } = await twoTurnsInFlight()
    b.cancel()
    expect(sidecar.cancels).toEqual([b.id])

    sidecar.endTurn(b.id, 'cancelled')
    sidecar.endTurn(a.id)
    await Promise.all([turnA, turnB])
  })

  it('hands the hosted tool handler the attributed session, and correlates the reply', async () => {
    const { sidecar, client, a, turnA, turnB, b } = await twoTurnsInFlight()
    const seen: Array<string | undefined> = []
    client.onToolCall(async (call: HarnessToolCall, sessionId?: string) => {
      seen.push(sessionId)
      return { ok: true, result: { tool: call.tool, ranFor: sessionId } }
    })

    const attributed = await sidecar.toolCall({ tool: 'read_tree', args: {} }, a.id)
    expect(attributed.t).toBe('toolResult')
    expect(attributed.result).toEqual({
      ok: true,
      result: { tool: 'read_tree', ranFor: a.id },
    })

    // the sidecar couldn't attribute this one — the renderer decides the
    // fallback (see harnessChatPanel.test.tsx), so the handler just sees undefined
    const unattributed = await sidecar.toolCall({ tool: 'read_tree', args: {} })
    expect(unattributed.result.result.ranFor).toBeUndefined()
    expect(seen).toEqual([a.id, undefined])

    sidecar.endTurn(a.id)
    sidecar.endTurn(b.id)
    await Promise.all([turnA, turnB])
  })

  it('attributes a permission request to its session and returns the decision', async () => {
    const { sidecar, client, a, b, turnA, turnB } = await twoTurnsInFlight()
    client.onPermissionRequest(async (_req: any, sessionId?: string) => ({
      outcome: 'selected',
      optionId: sessionId === b.id ? 'allow' : 'reject',
    }))

    const reply = await sidecar.permissionRequest(b.id, {
      toolCall: { toolCallId: 'tc1', title: 'write file' },
      options: [
        { optionId: 'allow', name: 'Allow', kind: 'allow_once' },
        { optionId: 'reject', name: 'Reject', kind: 'reject_once' },
      ],
    })
    expect(reply.decision).toEqual({ outcome: 'selected', optionId: 'allow' })

    sidecar.endTurn(a.id)
    sidecar.endTurn(b.id)
    await Promise.all([turnA, turnB])
  })

  it('lets a reloaded renderer adopt a turn the previous one started', async () => {
    const { sidecar, a, b, turnA } = await twoTurnsInFlight()
    sidecar.update(a.id, { type: 'message', text: 'started before ' })

    // --- the reload: a new client + registry, the same host and sessions ---
    const reloaded = new DevSidecarHarnessClient()
    const registry2 = new SessionRegistry({
      persist: (() => {}) as any,
      now: () => 2_000,
    })
    const ready = reloaded.initialize()
    await Promise.resolve()
    sidecar.attach(FakeSocket.current as FakeSocket) // the host talks to the new one
    await ready

    const held = await reloaded.listSessions()
    expect(held).toEqual([
      { sessionId: a.id, inFlight: true },
      { sessionId: b.id, inFlight: true },
    ])

    const resumed = await reloaded.resumeSession(a.id)
    registry2.open({
      id: resumed.id,
      projectId: 'projectOne',
      chatKey: 'projectOne::fake-agent',
      agentName: 'fake-agent',
      session: resumed,
      // what the store had persisted mid-answer
      messages: [
        { id: 1, role: 'user', text: 'ask A', at: 1 },
        { id: 2, role: 'agent', text: 'started before ', at: 2 },
      ],
    })
    expect(registry2.adoptTurn(a.id)).toBe(true)
    expect(registry2.get(a.id)!.busy).toBe(true)

    // the rest of the turn arrives on the new connection and lands in place
    sidecar.update(a.id, { type: 'message', text: 'and after the reload' })
    expect(registry2.get(a.id)!.messages[1].text).toBe(
      'started before and after the reload'
    )

    // the host's session-addressed end reaches the adopter, whose prompt promise
    // died with the old connection
    sidecar.endTurn(a.id)
    expect(registry2.get(a.id)!.busy).toBe(false)

    // the OLD renderer's prompt promise is orphaned by design: its socket is
    // gone, so the correlated turnEnd goes to the reloaded renderer, which has
    // no pending id for it. Nothing awaits it — that renderer no longer exists.
    let settled = false
    turnA.then(() => (settled = true))
    await Promise.resolve()
    expect(settled).toBe(false)
    expect(sidecar.held.has(b.id)).toBe(true) // B still running, untouched
  })

  it('ignores updates for a session nothing is listening to', async () => {
    const { sidecar, a, text, turnA, turnB, b } = await twoTurnsInFlight()
    expect(() =>
      sidecar.update('S-not-here', { type: 'message', text: 'orphan' })
    ).not.toThrow()
    expect(text(a.id)).toBe('')

    sidecar.endTurn(a.id)
    sidecar.endTurn(b.id)
    await Promise.all([turnA, turnB])
  })
})
