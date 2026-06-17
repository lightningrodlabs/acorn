import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useSelector, useStore } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import './HarnessChat.scss'
import { CellIdString } from '../../types/shared'
import { readTree, readSelection, SelectedNode } from '../../harness/readTree'
import {
  ChatMessage,
  deleteSession,
  getCurrentId,
  getSessionMessages,
  listSessions,
  loadStore,
  persistTurn,
  SessionRecord,
} from '../../harness/chatHistory'
import {
  computeProjectDiff,
  isEmptyDiff,
  ProjectSnapshot,
} from '../../migrating/projectDiff'
import { setTextInputFocused } from '../../redux/ephemeral/keyboard/actions'
import {
  getHarnessClient,
  HarnessContentBlock,
  HarnessPermissionDecision,
  HarnessPermissionRequest,
  HarnessPlanEntry,
  HarnessSession,
} from '../../harness'

// Thin vertical slice of the in-app LLM chat (LLM-direct-API branch): chat →
// harness → reply, over the transport-neutral HarnessClient. Each turn carries
// the live read_tree snapshot (resent only when it changed since last sent, so
// the agent never works off a stale tree) plus the current selection. No tree
// EDITS yet — the propose→draft→commit pipeline is the next branch; the ACP
// plan / permission seams are already plumbed for it.

// Seconds without any session/update before we flag a possible stall. ACP has
// no heartbeat, so this is the best signal that the agent has gone quiet.
const STALL_SECS = 20

// Persisted panel geometry (a UI preference, shared across projects). Native
// CSS resize lives on the DOM element, which is lost when the panel unmounts on
// close — so we persist it and reapply on open.
const FRAME_KEY = 'acorn:harnessChat:frame'
type Frame = { width: number; height: number; left: number; top: number }
const loadFrame = (): Frame | null => {
  try {
    const raw = localStorage.getItem(FRAME_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}
const saveFrame = (f: Frame) => {
  try {
    localStorage.setItem(FRAME_KEY, JSON.stringify(f))
  } catch (_) {}
}
const clampNum = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max))
// Keep the panel on-screen (e.g. if the window was resized smaller while closed):
// at least `keep` px stays visible horizontally, and the header stays reachable.
const clampToViewport = (left: number, top: number, w: number, h: number) => {
  const keep = 80
  return {
    left: clampNum(left, keep - w, window.innerWidth - keep),
    top: clampNum(top, 0, Math.max(0, window.innerHeight - 40)),
  }
}

// Compact relative time for the history picker.
const relativeTime = (then: number, now: number): string => {
  const s = Math.max(0, Math.floor((now - then) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// A concise note naming the selected node(s), prepended to a turn so the agent
// can resolve "this"/"these". Ids match what the human sees in the UI sidebar.
const selectionNote = (selected: SelectedNode[]): string =>
  'Context — node(s) currently selected in the tree:\n' +
  selected.map((s) => `- #${s.id} "${s.content}"`).join('\n')

// On a permission request, allow/reject via a confirm for the slice. (The draft
// pipeline will route this through the in-app review UI instead.)
async function decidePermission(
  req: HarnessPermissionRequest
): Promise<HarnessPermissionDecision> {
  const ok = window.confirm(
    `The agent is requesting permission to: ${req.toolCall.title || 'act'}\n\nAllow?`
  )
  const want = ok ? 'allow' : 'reject'
  const opt = req.options.find((o) => o.kind.startsWith(want))
  return opt
    ? { outcome: 'selected', optionId: opt.optionId }
    : { outcome: 'cancelled' }
}

const HarnessChat: React.FC = () => {
  const projectPage = useRouteMatch<{ projectId: CellIdString }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : null
  const store = useStore()

  const sessionRef = useRef<HarnessSession | null>(null)
  // the tree snapshot last handed to the agent — used to resend only on change
  const lastTreeRef = useRef<ProjectSnapshot | null>(null)
  const msgId = useRef(0)
  // current session id, persisted so a reload can resume (see resume effect)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'ready' | 'error'>(
    'idle'
  )
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [thought, setThought] = useState('')
  const [plan, setPlan] = useState<HarnessPlanEntry[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  // Liveness: ACP has no heartbeat, so "moving" = session/update notifications
  // arriving. We track the time of the last update and surface a stall hint when
  // the agent has gone quiet mid-turn. `activity` is a human label for the most
  // recent update kind.
  const activityAtRef = useRef(0)
  const [idleSecs, setIdleSecs] = useState(0)
  const [activity, setActivity] = useState('')
  // whether the chat textarea owns the keyboard — when true, the tree's global
  // shortcuts (Enter/arrows/Backspace) are suppressed so typing never disturbs
  // the tree. Mirrored into redux so the suppression is enforced globally.
  const [focused, setFocused] = useState(false)
  // header history picker
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  // MCP servers the agent can reach this session (e.g. "linear"), from initialize
  const [mcpServers, setMcpServers] = useState<string[]>([])

  const setKeyboardOwnership = (own: boolean) => {
    setFocused(own)
    store.dispatch(setTextInputFocused(own))
  }
  // Safety: if the panel unmounts while focused, hand the keyboard back.
  useEffect(() => () => store.dispatch(setTextInputFocused(false)), [])

  // Selected node(s), reactively, for the header. Subscribe to just the hash
  // array (stable ref unless selection changes) so canvas hover/mouse churn
  // doesn't re-render the chat; derive the names off the live store.
  const selectedHashes: string[] = useSelector(
    (s: any) => s.ui.selection.selectedOutcomes
  )
  const selectedNodes = useMemo(
    () => (projectId ? readSelection(store.getState() as any, projectId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedHashes, projectId]
  )

  // Draggable position — null until first opened, then pinned (starts right).
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  // Close the history picker on any click outside it (transcript, textbox, the
  // map — anywhere). Clicks on the toggle/dropdown are inside this ref, so the
  // toggle button keeps handling its own open/close.
  const histRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(histRef, () => setShowHistory(false))

  // Auto-scroll: stick to the bottom unless the user has scrolled up.
  const transcriptRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const onTranscriptScroll = () => {
    const el = transcriptRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  // On open, restore the saved size (or measure the default right-anchored
  // placement) and pin an explicit, on-screen left/top. Runs on every open so a
  // window shrink while closed can't leave the panel off-screen.
  useLayoutEffect(() => {
    if (!open) return
    const el = panelRef.current
    if (!el) return
    const saved = loadFrame()
    let w = el.offsetWidth
    let h = el.offsetHeight
    if (saved) {
      w = clampNum(saved.width, 200, window.innerWidth)
      h = clampNum(saved.height, 160, window.innerHeight)
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    }
    const base = pos || (saved ? { left: saved.left, top: saved.top } : el.getBoundingClientRect())
    setPos(clampToViewport(base.left, base.top, w, h))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Persist size as the user resizes (native resize writes to the DOM element).
  useEffect(() => {
    if (!open) return
    const el = panelRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      saveFrame({ width: el.offsetWidth, height: el.offsetHeight, left: r.left, top: r.top })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [open])

  // Keep pinned to the bottom as content streams in (only if already at bottom).
  useLayoutEffect(() => {
    const el = transcriptRef.current
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, thought, plan])

  // Reopening the window scrolls to the latest.
  useEffect(() => {
    if (!open) return
    atBottomRef.current = true
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [open])

  // Persist session id + transcript so a renderer reload can resume: the sidecar
  // keeps the agent + ACP session alive across the WS drop, so on reopen we
  // reattach by id and restore the visible history.
  useEffect(() => {
    if (!projectId || !sessionId) return
    persistTurn(projectId, sessionId, messages, Date.now())
  }, [projectId, sessionId, messages])

  // While a turn is in flight, tick "seconds since last update" so the UI can
  // show progress and flag a stall (no built-in ACP heartbeat to lean on).
  useEffect(() => {
    if (!busy) return
    const id = setInterval(
      () => setIdleSecs(Math.floor((Date.now() - activityAtRef.current) / 1000)),
      1000
    )
    return () => clearInterval(id)
  }, [busy])

  if (!projectId) return null
  const client = getHarnessClient()
  // No harness host in this context (prod build / Moss without the affordance).
  if (!client.available) return null

  const appendMessage = (
    role: ChatMessage['role'],
    text: string
  ): number => {
    const id = ++msgId.current
    setMessages((prev) => [...prev, { id, role, text }])
    return id
  }
  const updateMessage = (id: number, fn: (prev: string) => string) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: fn(m.text) } : m))
    )

  // Attach to a session: resume `target` if given and the host still has it
  // (live reattach, or ACP session/load across a restart), else start fresh.
  // Restores that session's transcript from the local store.
  const openSession = async (target: string | null) => {
    let session: HarnessSession | null = null
    if (target && client.resumeSession) {
      try {
        session = await client.resumeSession(target)
        const restored = getSessionMessages(projectId, target)
        setMessages(restored)
        msgId.current = restored.reduce((m, x) => Math.max(m, x.id), 0)
      } catch (_) {
        session = null
      }
    }
    if (!session) {
      session = await client.newSession({})
      setMessages([])
      msgId.current = 0
    }
    sessionRef.current = session
    setSessionId(session.id)
    // (re)attached ⇒ the next turn re-sends the full current tree (read_tree)
    lastTreeRef.current = null
  }

  const connect = async () => {
    setOpen(true)
    if (phase === 'ready' || phase === 'connecting') return
    setPhase('connecting')
    setError('')
    try {
      client.onPermissionRequest(decidePermission)
      const info = await client.initialize()
      setMcpServers(info.mcpServers || [])
      await openSession(getCurrentId(projectId)) // resume the last chat
      setPhase('ready')
    } catch (e: any) {
      setPhase('error')
      setError(e?.message || String(e))
    }
  }

  // --- header history picker ---
  const toggleHistory = () => {
    setSessions(listSessions(loadStore(projectId)))
    setShowHistory((s) => !s)
  }
  const pickSession = async (id: string) => {
    setShowHistory(false)
    if (id !== sessionId) await openSession(id)
  }
  const newChat = async () => {
    setShowHistory(false)
    await openSession(null)
  }
  const removeChat = async (id: string) => {
    deleteSession(projectId, id)
    setSessions(listSessions(loadStore(projectId)))
    if (id === sessionId) await openSession(null) // dropped the open one
  }

  const send = async () => {
    const session = sessionRef.current
    const text = input.trim()
    if (!session || busy || !text) return
    setInput('')
    setThought('')
    setPlan([])
    appendMessage('user', text)
    // Assemble the turn's context: current tree (only if it changed since we last
    // sent it — keeps the agent current without resending a large unchanged tree)
    // + the live selection (so "this"/"these" resolve) + the user's text last.
    const liveState = store.getState() as any
    const snapshot = readTree(liveState, projectId)
    const prev = lastTreeRef.current
    const treeChanged = !prev || !isEmptyDiff(computeProjectDiff(prev, snapshot))
    const blocks: HarnessContentBlock[] = []
    if (treeChanged) {
      blocks.push({
        type: 'resource',
        uri: `acorn://tree/${projectId}`,
        mimeType: 'application/json',
        text: JSON.stringify(snapshot),
      })
      if (prev) appendMessage('system', '↻ sent updated tree')
      lastTreeRef.current = snapshot
    }
    const selected = readSelection(liveState, projectId)
    if (selected.length)
      blocks.push({ type: 'text', text: selectionNote(selected) })
    blocks.push({ type: 'text', text })
    const agentId = appendMessage('agent', '')
    // every update is a heartbeat — reset the idle clock and label what's happening
    const beat = (label: string) => {
      activityAtRef.current = Date.now()
      setIdleSecs(0)
      setActivity(label)
    }
    const unsub = session.on('update', (u) => {
      if (u.type === 'message') {
        updateMessage(agentId, (p) => p + u.text)
        beat('Responding…')
      } else if (u.type === 'thought') {
        setThought((t) => t + u.text)
        beat('Thinking…')
      } else if (u.type === 'plan') {
        setPlan(u.entries)
        beat('Planning…')
      } else if (u.type === 'tool_call') {
        updateMessage(agentId, (p) => (p === '' ? `⚙ ${u.title} (${u.status})` : p))
        beat(`Running ${u.title || 'tool'}…`)
      }
    })
    beat('Thinking…')
    setBusy(true)
    try {
      const result = await session.prompt(blocks)
      if (result.stopReason === 'refusal')
        updateMessage(agentId, (p) => p || '(the agent declined)')
    } catch (e: any) {
      updateMessage(agentId, (p) => p || `(error: ${e?.message || e})`)
    } finally {
      unsub()
      setBusy(false)
      setThought('')
      setActivity('')
    }
  }

  // Drag the panel by its header. Listeners are scoped to the gesture so there's
  // nothing to clean up across renders; clicks on the close button don't drag.
  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (!panelRef.current) return
    e.preventDefault()
    const r = panelRef.current.getBoundingClientRect()
    const dx = e.clientX - r.left
    const dy = e.clientY - r.top
    setPos({ left: r.left, top: r.top })
    const move = (ev: MouseEvent) =>
      setPos({ left: ev.clientX - dx, top: ev.clientY - dy })
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      const el = panelRef.current
      if (el) {
        const rr = el.getBoundingClientRect()
        saveFrame({ width: el.offsetWidth, height: el.offsetHeight, left: rr.left, top: rr.top })
      }
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  if (!open) {
    return (
      <button className="harness-chat-launch" onClick={connect}>
        Chat with tree
      </button>
    )
  }

  const panelStyle: React.CSSProperties | undefined = pos
    ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' }
    : undefined

  return (
    <div
      ref={panelRef}
      className={`harness-chat${focused ? ' keyboard-owned' : ''}`}
      style={panelStyle}
    >
      <div className="harness-chat-head" onMouseDown={startDrag}>
        <span>Tree chat</span>
        <span className="harness-chat-mode">
          {focused ? '⌨ chat — tree keys paused' : 'tree keys active'}
        </span>
        <div
          className="harness-chat-history-wrap"
          ref={histRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="harness-chat-icon-btn"
            aria-label="Chat history"
            title="Resume a chat"
            disabled={busy || phase !== 'ready'}
            onClick={toggleHistory}
          >
            ≡
          </button>
          {showHistory && (
            <div className="harness-chat-history">
              <button className="hist-row hist-new" onClick={newChat}>
                ＋ New chat
              </button>
              {sessions.length === 0 && (
                <div className="hist-empty">No saved chats yet</div>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`hist-row${s.id === sessionId ? ' current' : ''}`}
                >
                  <button
                    className="hist-pick"
                    title={s.title}
                    onClick={() => pickSession(s.id)}
                  >
                    <span className="hist-title">{s.title}</span>
                    <span className="hist-time">
                      {relativeTime(s.updatedAt, Date.now())}
                    </span>
                  </button>
                  <button
                    className="hist-del"
                    aria-label="Delete chat"
                    title="Delete"
                    onClick={() => removeChat(s.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="harness-chat-close"
          aria-label="Close"
          onClick={() => {
            setKeyboardOwnership(false)
            setOpen(false)
          }}
        >
          ×
        </button>
      </div>

      {selectedNodes.length > 0 && (
        <div
          className="harness-chat-selection"
          title={selectedNodes.map((n) => `#${n.id} ${n.content}`).join('\n')}
        >
          <span className="dot">◉</span>
          <span className="name">
            {selectedNodes[0].content || `#${selectedNodes[0].id}`}
          </span>
          {selectedNodes.length > 1 && (
            <span className="more">&nbsp;(+{selectedNodes.length - 1} more)</span>
          )}
        </div>
      )}

      {phase === 'ready' && mcpServers.length > 0 && (
        <div
          className="harness-chat-mcp"
          title="MCP servers the agent can use this session"
        >
          {mcpServers.map((name) => (
            <span key={name} className="mcp-chip">
              🔌 {name}
            </span>
          ))}
        </div>
      )}

      {phase === 'connecting' && (
        <div className="harness-chat-status">Connecting to harness…</div>
      )}
      {phase === 'error' && (
        <div className="harness-chat-status error">{error}</div>
      )}

      {phase === 'ready' && (
        <>
          <div
            className="harness-chat-transcript"
            ref={transcriptRef}
            onScroll={onTranscriptScroll}
          >
            {messages.map((m) => (
              <div key={m.id} className={`harness-msg ${m.role}`}>
                {m.role === 'agent' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {busy && thought && (
              <div className="harness-msg thought">{thought}</div>
            )}
            {plan.length > 0 && (
              <ul className="harness-plan">
                {plan.map((e, i) => (
                  <li key={i} className={`plan-${e.status}`}>
                    {e.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {busy && (
            <div
              className={`harness-chat-thinking${
                idleSecs >= STALL_SECS ? ' stalled' : ''
              }`}
            >
              <span className="spinner" />
              <span className="label">
                {idleSecs >= STALL_SECS
                  ? `No updates for ${idleSecs}s — still working, or stalled. Stop to cancel.`
                  : `${activity || 'Thinking…'}${
                      idleSecs >= 3 ? ` (${idleSecs}s)` : ''
                    }`}
              </span>
            </div>
          )}
          <div className="harness-chat-input">
            <textarea
              value={input}
              placeholder="Ask about the tree…"
              onFocus={() => setKeyboardOwnership(true)}
              onBlur={() => setKeyboardOwnership(false)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            {busy ? (
              <button onClick={() => sessionRef.current?.cancel()}>Stop</button>
            ) : (
              <button onClick={send} disabled={!input.trim()}>
                Send
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default HarnessChat
