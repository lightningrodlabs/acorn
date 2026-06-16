import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useSelector, useStore } from 'react-redux'

import './HarnessChat.scss'
import { CellIdString } from '../../types/shared'
import { readTree, readSelection, SelectedNode } from '../../harness/readTree'
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

type ChatMessage = {
  id: number
  role: 'user' | 'agent' | 'system'
  text: string
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
  // whether the chat textarea owns the keyboard — when true, the tree's global
  // shortcuts (Enter/arrows/Backspace) are suppressed so typing never disturbs
  // the tree. Mirrored into redux so the suppression is enforced globally.
  const [focused, setFocused] = useState(false)

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

  // Auto-scroll: stick to the bottom unless the user has scrolled up.
  const transcriptRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const onTranscriptScroll = () => {
    const el = transcriptRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  // On first open, convert the default (right-anchored) CSS placement to an
  // explicit left/top so dragging + resize behave consistently.
  useLayoutEffect(() => {
    if (open && pos === null && panelRef.current) {
      const r = panelRef.current.getBoundingClientRect()
      setPos({ left: r.left, top: r.top })
    }
  }, [open, pos])

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

  const connect = async () => {
    setOpen(true)
    if (phase === 'ready' || phase === 'connecting') return
    setPhase('connecting')
    setError('')
    try {
      client.onPermissionRequest(decidePermission)
      await client.initialize()
      const session = await client.newSession({})
      sessionRef.current = session
      // fresh session ⇒ the next turn sends the full current tree (read_tree)
      lastTreeRef.current = null
      setPhase('ready')
    } catch (e: any) {
      setPhase('error')
      setError(e?.message || String(e))
    }
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
    const unsub = session.on('update', (u) => {
      if (u.type === 'message') updateMessage(agentId, (p) => p + u.text)
      else if (u.type === 'thought') setThought((t) => t + u.text)
      else if (u.type === 'plan') setPlan(u.entries)
      else if (u.type === 'tool_call')
        updateMessage(agentId, (p) =>
          p === '' ? `⚙ ${u.title} (${u.status})` : p
        )
    })
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
                {m.text}
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
