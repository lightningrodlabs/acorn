/**
 * SessionRegistry — per-session live chat state, held OUTSIDE the chat panel
 * (concurrent-sessions branch, leaf: session-registry).
 *
 * HarnessChat used to hold one sessionRef + one busy flag + one in-memory
 * transcript, making the whole panel modal on the in-flight turn: sending a
 * prompt locked the input, and switching sessions (or projects) abandoned the
 * stream. The registry inverts that: every open session keeps its own live
 * entry — handle, busy flag, streaming transcript, plan, activity clock — and
 * a turn streams into its entry whether or not that session is displayed. The
 * panel is a VIEW over the registry: switching sessions swaps which entry
 * renders; it never cancels, blocks, or hides a running turn.
 *
 * Persistence happens here too (not in a React effect): each mutation persists
 * the owning entry under its own (chatKey, sessionId), so an incoherent
 * "messages from one chat under another chat's id" pair — which the panel
 * previously guarded against with messagesSessionRef — is impossible by
 * construction.
 *
 * The registry is deliberately framework-free (no React, no redux) and takes
 * its I/O (persist, clock) as injectable deps, so the turn-streaming and
 * concurrency logic is unit-testable against a fake HarnessSession.
 */
import {
  ChatMessage,
  ChatSelection,
  ChatToolCall,
  PlanSnapshot,
  persistTurn,
} from './chatHistory'
import {
  HarnessContentBlock,
  HarnessPlanEntry,
  HarnessSession,
  Unsubscribe,
} from './types'

/** One session's live state. `session` is the transport handle; everything else
 *  is what the panel needs to render this chat at any moment. */
export interface LiveSession {
  readonly id: string
  /** the project this session belongs to — tool calls route here, NOT to
   *  whatever project happens to be displayed when the call lands */
  readonly projectId: string
  /** persistence scope: scopeProject(projectId, agentName) */
  readonly chatKey: string
  readonly agentName: string | null
  readonly session: HarnessSession
  messages: ChatMessage[]
  nextMsgId: number
  /** a turn is in flight on this session */
  busy: boolean
  /** human label for the latest update kind ("Thinking…", "Running read_tree…") */
  activity: string
  /** when the last update arrived (ms epoch) — feeds the stall indicator */
  activityAt: number
  /** the agent's latest plan (ACP replaces wholesale) */
  plan: HarnessPlanEntry[]
  /** plan evolution over the session, for capture/persistence */
  planSnapshots: PlanSnapshot[]
  /** nodes this session proposed edits to (feeds the attach control's target) */
  editedNodes: Set<string>
  /** the tree snapshot last handed to the agent — resend only on change */
  lastTree: unknown | null
}

export interface RegistryDeps {
  persist?: typeof persistTurn
  now?: () => number
}

export class SessionRegistry {
  private entries = new Map<string, LiveSession>()
  private subs = new Set<() => void>()
  private persist: typeof persistTurn
  private clock: () => number

  constructor(deps: RegistryDeps = {}) {
    this.persist = deps.persist || persistTurn
    this.clock = deps.now || Date.now
  }

  /** Coarse-grained change signal: fires on ANY entry change. The panel
   *  re-renders and re-reads whatever entries it displays. */
  subscribe(cb: () => void): Unsubscribe {
    this.subs.add(cb)
    return () => this.subs.delete(cb)
  }
  private emit(): void {
    for (const cb of this.subs) cb()
  }

  get(id: string | null | undefined): LiveSession | undefined {
    return id ? this.entries.get(id) : undefined
  }

  list(projectId?: string): LiveSession[] {
    const all = [...this.entries.values()]
    return projectId ? all.filter((e) => e.projectId === projectId) : all
  }

  /** True when any session (in any project) has a turn in flight. */
  anyBusy(): boolean {
    for (const e of this.entries.values()) if (e.busy) return true
    return false
  }

  /** The single busy entry, if EXACTLY one turn is in flight anywhere — the
   *  unambiguous fallback for routing an unattributed hosted tool call. */
  soleBusy(): LiveSession | undefined {
    let found: LiveSession | undefined
    for (const e of this.entries.values()) {
      if (!e.busy) continue
      if (found) return undefined // ambiguous
      found = e
    }
    return found
  }

  /**
   * Register a session as live. Restored transcripts come in via `messages` /
   * `planSnapshots`. If the id is already live (e.g. picking a session that is
   * mid-turn in the background), the EXISTING entry is returned untouched — its
   * stream must not be reset by re-opening it.
   */
  open(init: {
    id: string
    projectId: string
    chatKey: string
    agentName: string | null
    session: HarnessSession
    messages?: ChatMessage[]
    planSnapshots?: PlanSnapshot[]
  }): LiveSession {
    const existing = this.entries.get(init.id)
    if (existing) return existing
    const messages = init.messages || []
    const entry: LiveSession = {
      id: init.id,
      projectId: init.projectId,
      chatKey: init.chatKey,
      agentName: init.agentName,
      session: init.session,
      messages,
      nextMsgId: messages.reduce((m, x) => Math.max(m, x.id), 0),
      busy: false,
      activity: '',
      activityAt: 0,
      plan: [],
      planSnapshots: init.planSnapshots || [],
      editedNodes: new Set(),
      lastTree: null,
    }
    this.entries.set(entry.id, entry)
    this.emit()
    return entry
  }

  /** Drop a live entry (the stored transcript is untouched). No-op mid-turn:
   *  a running session keeps streaming until it finishes or is cancelled. */
  remove(id: string): void {
    const e = this.entries.get(id)
    if (!e || e.busy) return
    this.entries.delete(id)
    this.emit()
  }

  // --- message mutations (immutable arrays: the panel and capture code compare
  // --- references). Every mutation persists the entry and emits.

  appendMessage(
    id: string,
    role: ChatMessage['role'],
    text: string,
    selection?: ChatSelection[]
  ): number {
    const e = this.entries.get(id)
    if (!e) return 0
    const msgId = ++e.nextMsgId
    e.messages = [
      ...e.messages,
      {
        id: msgId,
        role,
        text,
        at: this.clock(),
        ...(selection && selection.length ? { selection } : {}),
      },
    ]
    this.touch(e)
    return msgId
  }

  updateMessage(id: string, msgId: number, fn: (prev: string) => string): void {
    const e = this.entries.get(id)
    if (!e) return
    e.messages = e.messages.map((m) =>
      m.id === msgId ? { ...m, text: fn(m.text) } : m
    )
    this.touch(e)
  }

  /** Record a tool call structurally on its message (newest status wins per id). */
  recordToolCall(id: string, msgId: number, tc: ChatToolCall): void {
    const e = this.entries.get(id)
    if (!e) return
    e.messages = e.messages.map((m) => {
      if (m.id !== msgId) return m
      const existing = m.toolCalls || []
      const at = existing.findIndex((c) => c.id === tc.id)
      const toolCalls =
        at >= 0 ? existing.map((c, i) => (i === at ? tc : c)) : [...existing, tc]
      return { ...m, toolCalls }
    })
    this.touch(e)
  }

  appendThinking(id: string, msgId: number, text: string): void {
    const e = this.entries.get(id)
    if (!e) return
    e.messages = e.messages.map((m) =>
      m.id === msgId ? { ...m, thinking: (m.thinking || '') + text } : m
    )
    this.touch(e)
  }

  /** Track nodes a session proposed edits to (attach-target computation). */
  noteEditedNodes(id: string, hashes: string[]): void {
    const e = this.entries.get(id)
    if (!e) return
    for (const h of hashes) e.editedNodes.add(h)
  }

  /** The snapshot last sent to this session's agent (null = none yet). */
  lastTree(id: string): unknown | null {
    const e = this.entries.get(id)
    return e ? e.lastTree : null
  }
  markTreeSent(id: string, snapshot: unknown): void {
    const e = this.entries.get(id)
    if (e) e.lastTree = snapshot
  }
  /** Force the next turn to re-send the tree (e.g. after re-attach). */
  clearTreeSent(id: string): void {
    const e = this.entries.get(id)
    if (e) e.lastTree = null
  }

  /**
   * Run one turn on a session: stream updates into ITS entry (busy flag,
   * transcript, plan, activity clock), independent of what the panel displays.
   * Resolves when the whole turn ends; errors surface as an agent message, so
   * a background turn never throws into nowhere.
   */
  async runTurn(id: string, blocks: HarnessContentBlock[]): Promise<void> {
    const e = this.entries.get(id)
    if (!e || e.busy) return
    const { agentMsgId, unsub } = this.beginStream(e)
    try {
      const result = await e.session.prompt(blocks)
      if (result.stopReason === 'refusal')
        this.updateMessage(id, agentMsgId, (p) => p || '(the agent declined)')
    } catch (err: any) {
      this.updateMessage(
        id,
        agentMsgId,
        (p) => p || `(error: ${err?.message || err})`
      )
    } finally {
      this.endStream(e, unsub)
    }
  }

  /**
   * Adopt a turn ALREADY running on the host — one this renderer didn't start,
   * because a reload dropped the connection but not the agent. It streams into
   * the entry exactly like runTurn; the difference is how it learns the turn
   * ended, since `prompt()`'s promise belonged to the dead connection. Returns
   * false when the provider can't report a foreign turn's end (nothing is
   * adopted rather than leaving an entry busy forever).
   */
  adoptTurn(id: string): boolean {
    const e = this.entries.get(id)
    if (!e || e.busy || !e.session.onTurnEnd) return false
    // Continue the trailing agent message: the pre-reload chunks were persisted
    // as they arrived, so the restored transcript already ends mid-answer.
    const { agentMsgId, unsub } = this.beginStream(e, true)
    let off: Unsubscribe = () => {}
    off = e.session.onTurnEnd((result) => {
      off()
      if (result.stopReason === 'refusal')
        this.updateMessage(id, agentMsgId, (p) => p || '(the agent declined)')
      this.endStream(e, unsub)
    })
    return true
  }

  /**
   * Start streaming a turn into `e`: mark it busy and subscribe its updates to
   * an agent message. `continueLast` appends to the trailing agent message
   * instead of opening a new one (adoption — see adoptTurn).
   */
  private beginStream(
    e: LiveSession,
    continueLast = false
  ): { agentMsgId: number; unsub: Unsubscribe } {
    const id = e.id
    e.plan = []
    const tail = e.messages[e.messages.length - 1]
    const resuming = continueLast && tail && tail.role === 'agent'
    const agentMsgId = resuming ? tail.id : this.appendMessage(id, 'agent', '')
    // Streamed text so far. Some ACP gateways deliver the answer twice — once as
    // live chunks, then as a consolidated copy — guard by skipping a chunk that
    // verbatim repeats the whole accumulation.
    let agentText = resuming ? tail.text : ''
    const beat = (label: string) => {
      e.activityAt = this.clock()
      e.activity = label
      this.emit()
    }
    const unsub = e.session.on('update', (u) => {
      if (u.type === 'message') {
        if (agentText && u.text === agentText) return // consolidated duplicate
        agentText += u.text
        this.updateMessage(id, agentMsgId, (p) => p + u.text)
        beat('Responding…')
      } else if (u.type === 'thought') {
        this.appendThinking(id, agentMsgId, u.text)
        beat('Thinking…')
      } else if (u.type === 'plan') {
        e.plan = u.entries
        e.planSnapshots = [
          ...e.planSnapshots,
          { at: this.clock(), entries: u.entries },
        ]
        beat('Planning…')
      } else if (u.type === 'tool_call') {
        this.updateMessage(id, agentMsgId, (p) =>
          p === '' ? `⚙ ${u.title} (${u.status})` : p
        )
        this.recordToolCall(id, agentMsgId, {
          id: u.toolCallId,
          title: u.title,
          status: u.status,
          ...(u.kind ? { kind: u.kind } : {}),
        })
        beat(`Running ${u.title || 'tool'}…`)
      }
    })
    beat('Thinking…')
    e.busy = true
    this.emit()
    return { agentMsgId, unsub }
  }

  /** Stop streaming: the turn is over however it ended. */
  private endStream(e: LiveSession, unsub: Unsubscribe): void {
    unsub()
    e.busy = false
    e.activity = ''
    this.emit()
    this.persistEntry(e)
  }

  /** Persist + notify after a message-level mutation. Persisting per mutation
   *  matches the panel's previous persist-on-every-messages-change effect. */
  private touch(e: LiveSession): void {
    this.persistEntry(e)
    this.emit()
  }

  private persistEntry(e: LiveSession): void {
    // keepCurrent: a background session's stream must not steal the "current
    // chat" pointer — displaying a chat is what makes it current.
    this.persist(
      e.chatKey,
      e.id,
      e.messages,
      this.clock(),
      e.agentName,
      e.planSnapshots,
      true
    )
  }
}

// The app-wide singleton: sessions OUTLIVE panel unmounts and project switches
// (a background turn keeps streaming while the human works elsewhere).
let singleton: SessionRegistry | null = null
export function getSessionRegistry(): SessionRegistry {
  if (!singleton) singleton = new SessionRegistry()
  return singleton
}

/** Test seam: drop the singleton so a test starts with an empty registry. The
 *  app never calls this — sessions outliving everything is the point. */
export function __resetSessionRegistry(): void {
  singleton = null
}
