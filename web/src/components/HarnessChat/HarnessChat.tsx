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
import remarkGfm from 'remark-gfm'
import RichText from '../RichText/RichText'

import './HarnessChat.scss'
import { CellIdString } from '../../types/shared'
import { readTree, readSelection, SelectedNode } from '../../harness/readTree'
import { handleAcornToolCall, isAcornToolTitle } from '../../harness/acornTools'
import { buildTranscript, anchorSelection } from '../../harness/transcript'
import { makeConversationArtifact } from '../../harness/conversationArtifact'
import { computeAttachTarget } from '../../harness/conversationAttach'
import {
  upsertConversationArtifact,
  findConversationHolders,
  makeConversationReference,
} from '../../harness/conversationDedup'
import { resolveRef, nodeDisplayLabel } from '../../nodeRef'
import { parseFields, serializeFields } from '../../outcomeFields'
import {
  ChatMessage,
  ChatSelection,
  ChatToolCall,
  PlanSnapshot,
  deriveTitle,
  deleteSession,
  getCurrentId,
  getSessionMessages,
  getSessionPlanSnapshots,
  listScopedSessions,
  migrateSession,
  moveSession,
  persistTurn,
  reclaimSessions,
  pruneEmptySessions,
  reusableEmptySessionId,
  scopeProject,
  SessionGroup,
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

// The chat is a right-docked, full-height panel that pushes the map aside rather
// than floating over it. Only its WIDTH is user-adjustable (drag the left edge);
// we persist that as a UI preference shared across projects. While open the width
// is published as `--acorn-chat-width` on <html>, which the map canvas subtracts
// from its own width (see MapView.scss) so the tree reflows into the space left
// of the panel and nothing is ever hidden behind it.
const WIDTH_KEY = 'acorn:harnessChat:width'
const CHAT_WIDTH_VAR = '--acorn-chat-width'
const DEFAULT_WIDTH = 360
const MIN_WIDTH = 280
// Cap at 80vw so the map never collapses to nothing on a narrow window.
const maxWidth = () => Math.round(window.innerWidth * 0.8)
const clampWidth = (w: number) => Math.max(MIN_WIDTH, Math.min(w, maxWidth()))
const loadWidth = (): number => {
  try {
    const n = parseInt(localStorage.getItem(WIDTH_KEY) || '', 10)
    return Number.isFinite(n) ? clampWidth(n) : DEFAULT_WIDTH
  } catch (_) {
    return DEFAULT_WIDTH
  }
}
const saveWidth = (w: number) => {
  try {
    localStorage.setItem(WIDTH_KEY, String(w))
  } catch (_) {}
}

// Friendly display label for an agent identifier. The raw value is the stable
// storage/identity key (an ACP `agentInfo.name` — e.g. the verbose package spec
// "@agentclientprotocol/claude-agent-acp", or "OpenCode"); this only changes
// what the picker shows. Unknown agents fall back to the last path segment, so
// any future backend still reads cleanly without needing an entry here.
const AGENT_LABELS: { match: RegExp; label: string }[] = [
  { match: /claude/i, label: 'Claude' },
  { match: /opencode/i, label: 'OpenCode' },
  { match: /gemini/i, label: 'Gemini' },
]
const prettyAgent = (agentName: string | null): string => {
  if (!agentName) return 'Earlier sessions'
  const hit = AGENT_LABELS.find((a) => a.match.test(agentName))
  return hit ? hit.label : agentName.split('/').pop() || agentName
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
  // Acorn's own hosted tools (read_tree / propose_edits) are non-destructive, so
  // auto-allow them instead of prompting — propose_edits only opens an inert
  // draft a human still has to Confirm before anything reaches the DHT.
  if (isAcornToolTitle(req.toolCall.title)) {
    const auto = req.options.find((o) => o.kind.startsWith('allow'))
    if (auto) return { outcome: 'selected', optionId: auto.optionId }
  }
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
  // the session id the in-memory `messages` array currently belongs to. Set
  // synchronously *before* setMessages so the persist effect can tell a coherent
  // (sessionId, messages) pair from the transient mismatch during a session swap:
  // React 16 commits setMessages and setSessionId in separate renders, so there's
  // a frame where `messages` is the new chat's but `sessionId` is still the old
  // one — persisting then would overwrite the old chat with the new chat's
  // messages (lost chat + duplicate title in the picker).
  const messagesSessionRef = useRef<string | null>(null)
  // the project the in-memory session/transcript belongs to. Chats are
  // per-project by default; switching projects resets the panel (the store stays
  // keyed by project, leaving room for a future cross-project mode).
  const projectRef = useRef(projectId)
  // The backing agent (from initialize), used to namespace the persisted chat
  // store: sessions minted by one backend (OpenCode, claude-agent-acp, …) carry
  // agent-specific ids that can't be resumed against another, so each agent owns
  // its own session space. Set synchronously in connect() before any session
  // open, so every chatHistory call below scopes to the right backend.
  const agentNameRef = useRef<string | null>(null)
  const chatKey = () => scopeProject(projectId as string, agentNameRef.current)
  // connection is driven by an effect (open + idle); these let the effect call
  // the latest connect() without forward-reference issues, and dedupe calls.
  const connectingRef = useRef(false)
  const connectRef = useRef<() => void>(() => {})
  // current session id, persisted so a reload can resume (see resume effect)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'ready' | 'error'>(
    'idle'
  )
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // Agent-message ids whose reasoning ("Thinking") block the user has expanded.
  // The in-flight message auto-expands while busy (see the transcript render);
  // this set holds explicit toggles, so completed turns stay collapsed until
  // opened. Reset whenever we swap the visible transcript (ids are reused).
  const [openThinking, setOpenThinking] = useState<Set<number>>(new Set())
  const [plan, setPlan] = useState<HarnessPlanEntry[]>([])
  // The agent's plan over the whole session, one snapshot per `plan` update.
  // A ref (not state) — it feeds persistence + capture, not rendering — and is
  // reset/restored alongside the session.
  const planSnapshotsRef = useRef<PlanSnapshot[]>([])
  // Node actionHashes this session proposed edits to (collected from propose_edits
  // tool calls). Feeds the attach control's default-target (LCA of edited nodes).
  const editedNodesRef = useRef<Set<string>>(new Set())
  // The in-panel "attach conversation" picker (null = closed). Replaces
  // window.prompt/confirm, which this webview doesn't support: it holds the
  // computed target + a human-editable override before the propose_edits draft.
  const [attach, setAttach] = useState<{
    transcript: any
    tree: any
    target: string | null
    reason: string
    label: string
    override: string
    error: string
    // actionHashes of OTHER nodes that already hold this session's conversation
    holders: string[]
    // when the session is already held elsewhere, attach a full copy anyway
    copyAnyway: boolean
  } | null>(null)
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
  // header history picker — all of this project's chats, grouped by the agent
  // that owns them (the attached backend plus any other backends' stored chats).
  const [showHistory, setShowHistory] = useState(false)
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([])
  // When set, we're showing another agent's chat read-only: its ACP session id
  // can't be resumed by the attached backend, so input is disabled until the
  // user starts/opens a chat under the current agent. Holds that agent's label.
  const [readOnlyAgent, setReadOnlyAgent] = useState<string | null>(null)
  // Session id whose "move to another agent" submenu is open (Part B).
  const [moveFor, setMoveFor] = useState<string | null>(null)
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

  // Panel width (px) — the only adjustable dimension; the panel is docked to the
  // right edge and spans the full viewport height.
  const [width, setWidth] = useState<number>(loadWidth)

  // Close the history picker on any click outside it (transcript, textbox, the
  // map — anywhere). Clicks on the toggle/dropdown are inside this ref, so the
  // toggle button keeps handling its own open/close.
  const histRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(histRef, () => {
    setShowHistory(false)
    setMoveFor(null)
  })

  // Auto-scroll: stick to the bottom unless the user has scrolled up.
  const transcriptRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const onTranscriptScroll = () => {
    const el = transcriptRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  // Publish the panel's footprint (0 when closed) as a CSS variable on <html> and
  // nudge the map to recompute its usable width. The map's `resize` listener reads
  // the canvas's new bounding box — now narrowed by this variable — and redraws
  // the tree into the space left of the panel. Persist the width while open.
  useEffect(() => {
    document.documentElement.style.setProperty(
      CHAT_WIDTH_VAR,
      open ? `${width}px` : '0px'
    )
    window.dispatchEvent(new Event('resize'))
    if (open) saveWidth(width)
  }, [open, width])

  // Hand the map its full width back if the panel unmounts (e.g. leaving the project).
  useEffect(
    () => () => {
      document.documentElement.style.setProperty(CHAT_WIDTH_VAR, '0px')
      window.dispatchEvent(new Event('resize'))
    },
    []
  )

  // Keep pinned to the bottom as content streams in (only if already at bottom).
  useLayoutEffect(() => {
    const el = transcriptRef.current
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, plan])

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
    // guard against persisting the previous project's messages under the new
    // project's key during a project switch (before the reset effect runs)
    if (!projectId || !sessionId || projectRef.current !== projectId) return
    // mid-swap: `messages` belong to a different session than `sessionId` (see
    // messagesSessionRef) — don't persist this incoherent pair, or we'd clobber
    // one chat's record with another chat's messages.
    if (messagesSessionRef.current !== sessionId) return
    persistTurn(
      scopeProject(projectId, agentNameRef.current),
      sessionId,
      messages,
      Date.now(),
      agentNameRef.current,
      planSnapshotsRef.current
    )
  }, [projectId, sessionId, messages])

  // Switching projects: tear down the previous project's in-memory chat back to
  // idle. If the panel was open it stays open and the auto-connect effect below
  // reconnects to the NEW project's own session (transcript stored per-project),
  // so streams never cross over but the chat follows the project.
  useEffect(() => {
    if (projectRef.current === projectId) return
    projectRef.current = projectId
    sessionRef.current = null
    lastTreeRef.current = null
    messagesSessionRef.current = null
    connectingRef.current = false
    setSessionId(null)
    setMessages([])
    setOpenThinking(new Set())
    setPlan([])
    planSnapshotsRef.current = []
    editedNodesRef.current = new Set()
    setBusy(false)
    setError('')
    setShowHistory(false)
    setReadOnlyAgent(null)
    setKeyboardOwnership(false)
    setPhase('idle') // open is left as-is; auto-connect picks up the new project
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Connect whenever the panel is open but not yet connected — on first open and
  // after a project switch resets to idle. connectRef holds the latest connect().
  useEffect(() => {
    if (open && phase === 'idle' && projectId) connectRef.current()
  }, [open, phase, projectId])

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
    text: string,
    selection?: ChatSelection[]
  ): number => {
    const id = ++msgId.current
    setMessages((prev) => [
      ...prev,
      {
        id,
        role,
        text,
        at: Date.now(),
        ...(selection && selection.length ? { selection } : {}),
      },
    ])
    return id
  }
  const updateMessage = (id: number, fn: (prev: string) => string) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: fn(m.text) } : m))
    )
  // Record a tool call structurally on its message (newest status wins per id),
  // so the captured transcript preserves which tools ran — and which were
  // propose_edits — not just the prose around them.
  const recordToolCall = (id: number, tc: ChatToolCall) =>
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const existing = m.toolCalls || []
        const at = existing.findIndex((c) => c.id === tc.id)
        const toolCalls =
          at >= 0
            ? existing.map((c, i) => (i === at ? tc : c))
            : [...existing, tc]
        return { ...m, toolCalls }
      })
    )
  // Accumulate the agent's reasoning stream onto its message, so it persists with
  // the transcript (and can be re-read) instead of living in transient state.
  const appendThinking = (id: number, text: string) =>
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, thinking: (m.thinking || '') + text } : m
      )
    )
  const toggleThinking = (id: number) =>
    setOpenThinking((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Attach to a session: resume `target` if given and the host still has it
  // (live reattach, or ACP session/load across a restart), else start fresh.
  // Restores that session's transcript from the local store.
  const openSession = async (target: string | null) => {
    setReadOnlyAgent(null) // leaving any read-only foreign-agent view
    setOpenThinking(new Set()) // ids are reused across sessions — drop stale toggles
    let session: HarnessSession | null = null
    if (target && client.resumeSession) {
      try {
        session = await client.resumeSession(target)
        const restored = getSessionMessages(chatKey(), target)
        // bind messages to this session before the setMessages commit (see ref)
        messagesSessionRef.current = session.id
        setMessages(restored)
        msgId.current = restored.reduce((m, x) => Math.max(m, x.id), 0)
        // restore the session's plan history so further updates append to it
        planSnapshotsRef.current = getSessionPlanSnapshots(chatKey(), target)
      } catch (_) {
        session = null
      }
    }
    if (!session) {
      session = await client.newSession({})
      // The host couldn't resume `target` (e.g. it restarted and lost the ACP
      // session). Don't drop the user's transcript — carry it forward onto the
      // new session id so the chat stays readable and continuable. A brand-new
      // chat (no target) just starts empty.
      const carried = target
        ? migrateSession(
            chatKey(),
            target,
            session.id,
            Date.now(),
            agentNameRef.current
          )
        : []
      // bind messages to this session before the setMessages commit (see ref)
      messagesSessionRef.current = session.id
      setMessages(carried)
      msgId.current = carried.reduce((m, x) => Math.max(m, x.id), 0)
      // carry the plan history onto the new id (migrateSession moved it), or
      // start clean for a brand-new chat
      planSnapshotsRef.current = target
        ? getSessionPlanSnapshots(chatKey(), session.id)
        : []
    }
    sessionRef.current = session
    setSessionId(session.id)
    // (re)attached ⇒ the next turn re-sends the full current tree (read_tree)
    lastTreeRef.current = null
    // keep at most one empty chat — discard any unused ones we left behind
    pruneEmptySessions(chatKey(), session.id)
  }

  const connect = async () => {
    if (connectingRef.current || phase === 'ready') return
    connectingRef.current = true
    setPhase('connecting')
    setError('')
    try {
      client.onPermissionRequest(decidePermission)
      // hosted callable tools (read_tree / propose_edits). propose_edits opens an
      // inert draft for human review — it never writes to the DHT (L1).
      client.onToolCall?.((call) => {
        // Track which nodes the session proposes edits to, so the attach control
        // can default to the branch it shaped (LCA of those nodes).
        if (call?.tool === 'propose_edits') {
          const diff = call.args && call.args.diff ? call.args.diff : call.args
          const outs = (diff && diff.outcomes) || {}
          for (const k of Object.keys(outs.updated || {})) editedNodesRef.current.add(k)
          for (const k of Object.keys(outs.added || {})) editedNodesRef.current.add(k)
        }
        return handleAcornToolCall(store, projectId, call)
      })
      const info = await client.initialize()
      // Scope the chat store to this backend before touching it: resuming a
      // session minted by a different agent fails (and can corrupt the agent's
      // stdio). Set synchronously so the resume below reads the right space.
      agentNameRef.current = info.agentName || null
      // Reclaim any of THIS backend's chats that earlier ended up in another
      // scope (e.g. pre-stamp data, or a chat opened under the wrong agent), and
      // backfill author stamps. Idempotent; only touches unstamped records.
      reclaimSessions(projectId, agentNameRef.current)
      setMcpServers(info.mcpServers || [])
      await openSession(getCurrentId(chatKey())) // resume the last chat
      setPhase('ready')
    } catch (e: any) {
      setPhase('error')
      setError(e?.message || String(e))
      // Harness is unreachable, but the transcript is stored locally — surface
      // the last chat so it stays readable (read-only) instead of vanishing
      // behind the error. We don't set sessionId, so the persist effect stays
      // off and we can't clobber the saved record.
      const lastId = getCurrentId(chatKey())
      if (lastId) {
        messagesSessionRef.current = lastId
        setMessages(getSessionMessages(chatKey(), lastId))
      }
    } finally {
      connectingRef.current = false
    }
  }
  // expose the latest connect to the auto-connect effect
  connectRef.current = connect

  // --- header history picker ---
  // Is this group the backend we're attached to (so its chats are resumable)?
  const isCurrentAgent = (agentName: string | null) =>
    (agentName || null) === (agentNameRef.current || null)

  const toggleHistory = () => {
    setSessionGroups(listScopedSessions(projectId))
    setMoveFor(null)
    setShowHistory((s) => !s)
  }
  const pickSession = async (id: string) => {
    setShowHistory(false)
    if (id !== sessionId) await openSession(id)
  }
  // Open another backend's chat read-only: restore its transcript for reading,
  // but don't attach a session (the attached agent can't resume a foreign ACP
  // id) — input stays disabled until the user starts a chat under this agent.
  const viewSession = (agentName: string | null, id: string) => {
    setShowHistory(false)
    const restored = getSessionMessages(scopeProject(projectId, agentName), id)
    sessionRef.current = null
    setSessionId(null)
    // null session id ⇒ the persist effect stays off, so viewing can't clobber
    // the stored record. messagesSessionRef must not match any real session id.
    messagesSessionRef.current = null
    msgId.current = restored.reduce((m, x) => Math.max(m, x.id), 0)
    setMessages(restored)
    setOpenThinking(new Set())
    setReadOnlyAgent(prettyAgent(agentName))
  }
  const newChat = async () => {
    setShowHistory(false)
    // already sitting in an unused (and editable) chat — nothing to create
    if (!readOnlyAgent && sessionRef.current && messages.length === 0) return
    // reuse an existing empty chat if there is one, else start fresh
    await openSession(reusableEmptySessionId(chatKey()))
  }
  const removeChat = async (agentName: string | null, id: string) => {
    deleteSession(scopeProject(projectId, agentName), id)
    setSessionGroups(listScopedSessions(projectId))
    // dropped the chat we have open under the current agent → start fresh
    if (isCurrentAgent(agentName) && id === sessionId) await openSession(null)
  }
  // Agents a chat can be re-homed to: the attached backend plus any other
  // backend that already owns chats here, minus the chat's current owner.
  const moveTargets = (fromAgent: string | null): string[] =>
    Array.from(
      new Set(
        [agentNameRef.current, ...sessionGroups.map((g) => g.agentName)].filter(
          (a): a is string => !!a && a !== (fromAgent || null)
        )
      )
    )
  const doMove = async (
    fromAgent: string | null,
    toAgent: string,
    id: string
  ) => {
    setMoveFor(null)
    moveSession(projectId, fromAgent, toAgent, id)
    setSessionGroups(listScopedSessions(projectId))
    // moved the open chat out from under the current agent → reset to fresh
    if (isCurrentAgent(fromAgent) && id === sessionId) await openSession(null)
  }

  const send = async () => {
    const session = sessionRef.current
    const text = input.trim()
    if (!session || busy || !text) return
    setInput('')
    setPlan([])
    // Capture the selection AT SEND TIME and pin it on the user turn: it is the
    // conversation's ask-time anchor, and must not be re-read later (the human
    // moves the selection while the agent works).
    const liveState = store.getState() as any
    const selected = readSelection(liveState, projectId)
    appendMessage('user', text, selected)
    // Assemble the turn's context: current tree (only if it changed since we last
    // sent it — keeps the agent current without resending a large unchanged tree)
    // + the live selection (so "this"/"these" resolve) + the user's text last.
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
    if (selected.length)
      blocks.push({ type: 'text', text: selectionNote(selected) })
    blocks.push({ type: 'text', text })
    const agentId = appendMessage('agent', '')
    // The agent text streamed so far this turn. Some ACP gateways (any where the
    // stream's message id doesn't match the final one — e.g. non-native-Anthropic
    // proxies) deliver the answer twice: once as live chunks, then again as a
    // consolidated copy the adapter's own streamed-vs-final dedupe failed to drop.
    // Guard here — skip a chunk that verbatim repeats the whole accumulation.
    let agentText = ''
    // every update is a heartbeat — reset the idle clock and label what's happening
    const beat = (label: string) => {
      activityAtRef.current = Date.now()
      setIdleSecs(0)
      setActivity(label)
    }
    const unsub = session.on('update', (u) => {
      if (u.type === 'message') {
        beat('Responding…')
        if (agentText && u.text === agentText) return // consolidated duplicate
        agentText += u.text
        updateMessage(agentId, (p) => p + u.text)
      } else if (u.type === 'thought') {
        appendThinking(agentId, u.text)
        beat('Thinking…')
      } else if (u.type === 'plan') {
        setPlan(u.entries)
        // Append a session-level snapshot so the plan's evolution is captured for
        // the transcript (the live `plan` state only shows the latest).
        planSnapshotsRef.current = [
          ...planSnapshotsRef.current,
          { at: Date.now(), entries: u.entries },
        ]
        beat('Planning…')
      } else if (u.type === 'tool_call') {
        updateMessage(agentId, (p) => (p === '' ? `⚙ ${u.title} (${u.status})` : p))
        recordToolCall(agentId, {
          id: u.toolCallId,
          title: u.title,
          status: u.status,
          ...(u.kind ? { kind: u.kind } : {}),
        })
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
      setActivity('')
    }
  }

  // Attach this session's captured conversation to the branch it shaped, as a
  // conversation artifact — via the propose_edits draft (human confirms). The
  // target is computed (LCA of edited nodes; else the first-turn ask-time anchor;
  // root-LCA asks first), never the live selection.
  // Human-readable one-liner for a node: "[handle] first 60 chars of content".
  const describeNode = (tree: any, hash: string): string => {
    const o = tree?.outcomes?.[hash]
    if (!o) return hash
    const label = nodeDisplayLabel({ actionHash: hash, description: o.description })
    return `[${label}] ${(o.content || '').slice(0, 60)}`
  }

  // Open the in-panel attach picker: compute the default target (LCA of edited
  // nodes, anchor folded in; else the first-turn anchor) and show it for the
  // human to accept or override. No window.prompt — this webview lacks it.
  const openAttach = () => {
    if (!projectId || !sessionId) return
    const transcript = buildTranscript(
      {
        id: sessionId,
        title: deriveTitle(messages),
        updatedAt: Date.now(),
        messages,
        agentName: agentNameRef.current || undefined,
        planSnapshots: planSnapshotsRef.current,
      },
      Date.now()
    )
    const tree = readTree(store.getState() as any, projectId)
    const anchor = anchorSelection(transcript)[0]?.actionHash || null
    const { target, reason } = computeAttachTarget({
      tree: tree as any,
      editedNodeIds: [...editedNodesRef.current],
      anchor,
    })
    // Nodes that already hold this session's conversation — so we reference
    // rather than scatter duplicate copies of a growing transcript.
    const holders = findConversationHolders(tree as any, transcript.sessionId)
    setAttach({
      transcript,
      tree,
      target,
      reason,
      label: target ? describeNode(tree, target) : '',
      override: '',
      error: '',
      holders,
      copyAnyway: false,
    })
  }

  // Commit the attach picker: resolve any override ref, upsert the conversation
  // artifact by sessionId (no duplicate copies), and open the propose_edits draft.
  const submitAttach = async () => {
    if (!attach || !projectId) return
    const { transcript, tree, target, reason, override } = attach
    const ref = override.trim()
    let chosen = target
    if (ref) {
      const resolved = resolveRef(tree as any, ref)
      if (!resolved) {
        setAttach({ ...attach, error: `No node found for "${ref}".` })
        return
      }
      chosen = resolved
    } else if (reason === 'none' || !chosen) {
      setAttach({
        ...attach,
        error:
          'No target could be computed — type a node handle / 6-digit id / actionHash below.',
      })
      return
    } else if (reason === 'prompt') {
      setAttach({
        ...attach,
        error:
          'Ambiguous target (the tree root): this session touched unrelated branches. Type a specific node below.',
      })
      return
    }

    const outcome: any = (tree as any).outcomes[chosen as string]
    if (!outcome) {
      setAttach({ ...attach, error: 'Target node not found in the live tree.' })
      return
    }
    const fields = parseFields(outcome.description || '')

    // Dedup: if this session's conversation is already held on ANOTHER node,
    // don't scatter a second full copy — attach a lightweight [[ref]] to the
    // canonical holder instead (unless the human ticked "copy anyway"). If the
    // chosen node itself already holds it, upsert grows the one copy in place.
    const holderElsewhere = attach.holders.filter((h) => h !== chosen)[0]
    let nextArtifacts
    if (holderElsewhere && !attach.copyAnyway) {
      const holderRef = nodeDisplayLabel({
        actionHash: holderElsewhere,
        description: (tree as any).outcomes[holderElsewhere]?.description,
      })
      const already = (fields.artifacts || []).some(
        (a) => a.type === 'conversation-ref' && (a.uri || '').trim() === holderRef
      )
      nextArtifacts = already
        ? fields.artifacts || []
        : [
            ...(fields.artifacts || []),
            makeConversationReference(holderRef, deriveTitle(messages)),
          ]
    } else {
      // Full canonical copy — upsert by sessionId (grow, never duplicate).
      const artifact = makeConversationArtifact(deriveTitle(messages), transcript)
      nextArtifacts = upsertConversationArtifact(fields.artifacts, artifact)
    }

    const updatedOutcome = {
      ...outcome,
      description: serializeFields({ ...fields, artifacts: nextArtifacts }),
    }
    await handleAcornToolCall(store, projectId, {
      tool: 'propose_edits',
      args: { diff: { outcomes: { updated: { [chosen as string]: updatedOutcome } } } },
    })
    setAttach(null)
  }

  // Resize by dragging the panel's left edge: the width is the distance from the
  // pointer to the (fixed) right edge of the window. Listeners are scoped to the
  // gesture. The width effect above republishes the CSS var + reflows the map on
  // every change, so the tree tracks the edge live as it's dragged.
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const move = (ev: MouseEvent) =>
      setWidth(clampWidth(window.innerWidth - ev.clientX))
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  if (!open) {
    return (
      <button className="harness-chat-launch" onClick={() => setOpen(true)}>
        Chat with tree
      </button>
    )
  }

  return (
    <div
      className={`harness-chat${focused ? ' keyboard-owned' : ''}`}
      style={{ width }}
    >
      {/* left-edge grip — drag to resize the panel (and reflow the map) */}
      <div
        className="harness-chat-resize"
        onMouseDown={startResize}
        title="Drag to resize"
      />
      <div className="harness-chat-head">
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
              {sessionGroups.length === 0 && (
                <div className="hist-empty">No saved chats yet</div>
              )}
              {/* current agent's chats first (resumable), other backends after
                  (read-only — their session ids can't be resumed here) */}
              {[...sessionGroups]
                .sort(
                  (a, b) =>
                    (isCurrentAgent(b.agentName) ? 1 : 0) -
                    (isCurrentAgent(a.agentName) ? 1 : 0)
                )
                .map((g) => {
                  const mine = isCurrentAgent(g.agentName)
                  return (
                    <div
                      key={g.agentName || '∅'}
                      className={`hist-group${mine ? ' current-agent' : ''}`}
                    >
                      <div className="hist-group-label">
                        <span title={g.agentName || undefined}>
                          {prettyAgent(g.agentName)}
                        </span>
                        {!mine && (
                          <span className="hist-readonly-tag">read-only</span>
                        )}
                      </div>
                      {g.sessions.map((s) => (
                        <div
                          key={s.id}
                          className={`hist-row${
                            mine && s.id === sessionId ? ' current' : ''
                          }`}
                        >
                          <button
                            className="hist-pick"
                            title={
                              mine
                                ? s.title
                                : `${s.title} (view only — chat lives under ${prettyAgent(
                                    g.agentName
                                  )})`
                            }
                            onClick={() =>
                              mine
                                ? pickSession(s.id)
                                : viewSession(g.agentName, s.id)
                            }
                          >
                            <span className="hist-title">{s.title}</span>
                            <span className="hist-time">
                              {relativeTime(s.updatedAt, Date.now())}
                            </span>
                          </button>
                          <div className="hist-move-wrap">
                            <button
                              className="hist-move"
                              aria-label="Move chat to another agent"
                              title="Move to another agent"
                              onClick={() =>
                                setMoveFor(moveFor === s.id ? null : s.id)
                              }
                            >
                              ⤳
                            </button>
                            {moveFor === s.id && (
                              <div className="hist-move-menu">
                                {moveTargets(g.agentName).length === 0 ? (
                                  <span className="hist-move-empty">
                                    no other agent
                                  </span>
                                ) : (
                                  moveTargets(g.agentName).map((a) => (
                                    <button
                                      key={a}
                                      title={`Move to ${prettyAgent(a)}`}
                                      onClick={() => doMove(g.agentName, a, s.id)}
                                    >
                                      → {prettyAgent(a)}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            className="hist-del"
                            aria-label="Delete chat"
                            title="Delete"
                            onClick={() => removeChat(g.agentName, s.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
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

      {(phase === 'ready' || phase === 'error') && (
        <>
          <div
            className="harness-chat-transcript"
            ref={transcriptRef}
            onScroll={onTranscriptScroll}
          >
            {messages.map((m, i) => {
              if (m.role !== 'agent')
                return (
                  <div key={m.id} className={`harness-msg ${m.role}`}>
                    {/* User messages go through RichText too, so [[handle]] /
                        [[123456]] references the human types are clickable —
                        system notices (e.g. "↻ sent updated tree") stay plain. */}
                    {m.role === 'user' ? (
                      <RichText source={m.text} remarkPlugins={[remarkGfm]} />
                    ) : (
                      m.text
                    )}
                  </div>
                )
              // The in-flight agent message is the last one while busy — auto-open
              // its reasoning so thinking stays visible live; once done it
              // collapses, reopenable via the toggle (state in openThinking).
              const streaming = busy && i === messages.length - 1
              const open = streaming || openThinking.has(m.id)
              return (
                <React.Fragment key={m.id}>
                  {m.thinking && (
                    <div className={`harness-msg thought${open ? ' open' : ''}`}>
                      <button
                        className="thought-toggle"
                        onClick={() => toggleThinking(m.id)}
                      >
                        {open ? '▾' : '▸'} Thinking
                      </button>
                      {open && <div className="thought-body">{m.thinking}</div>}
                    </div>
                  )}
                  {(m.text || !streaming) && (
                    <div className="harness-msg agent">
                      <RichText source={m.text} remarkPlugins={[remarkGfm]} />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
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
            {phase === 'error' && (
              <div className="harness-chat-input-error" role="alert">
                <span className="error-text">{error}</span>
                <button
                  className="reconnect"
                  onClick={() => {
                    setPhase('idle') // auto-connect effect picks it back up
                  }}
                >
                  Reconnect
                </button>
              </div>
            )}
            {readOnlyAgent && (
              <div className="harness-chat-input-error" role="status">
                <span className="error-text">
                  Read-only — this chat belongs to {readOnlyAgent} and can't be
                  continued here.
                </span>
                <button className="reconnect" onClick={() => newChat()}>
                  New chat
                </button>
              </div>
            )}
            {!readOnlyAgent && messages.length > 0 && (
              <div className="harness-chat-attach">
                {!attach ? (
                  <button
                    type="button"
                    className="harness-chat-attach-btn"
                    title="Attach this conversation to the branch it shaped (opens a draft to confirm)"
                    onClick={openAttach}
                  >
                    ⎘ Attach conversation to tree
                  </button>
                ) : (
                  <div className="harness-chat-attach-panel">
                    <div className="attach-target">
                      {attach.target ? (
                        <>
                          Attach to <strong>{attach.label}</strong>
                          <span className="attach-why">
                            {attach.reason === 'anchor'
                              ? ' — the node open when this conversation began'
                              : attach.reason === 'prompt'
                              ? ' — this touched unrelated branches (tree root); pick a real node below'
                              : ' — the branch this session shaped'}
                          </span>
                        </>
                      ) : (
                        <>No target could be computed — type a node below.</>
                      )}
                    </div>
                    <input
                      className="attach-override"
                      placeholder="override: handle / 6-digit id / actionHash (blank = accept above)"
                      value={attach.override}
                      onFocus={() => setKeyboardOwnership(true)}
                      onBlur={() => setKeyboardOwnership(false)}
                      onChange={(e) =>
                        setAttach({ ...attach, override: e.target.value, error: '' })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          submitAttach()
                        }
                      }}
                    />
                    {attach.holders.length > 0 && (
                      <label className="attach-dedup">
                        <span>
                          This conversation is already retained
                          {attach.holders.length > 1
                            ? ` on ${attach.holders.length} nodes`
                            : ' elsewhere'}
                          . A link to it will be attached here instead of a
                          second copy.
                        </span>
                        <span className="attach-copyanyway">
                          <input
                            type="checkbox"
                            checked={attach.copyAnyway}
                            onChange={(e) =>
                              setAttach({ ...attach, copyAnyway: e.target.checked })
                            }
                          />
                          attach a full copy anyway
                        </span>
                      </label>
                    )}
                    {attach.error && (
                      <div className="attach-error" role="alert">
                        {attach.error}
                      </div>
                    )}
                    <div className="attach-actions">
                      <button type="button" onClick={submitAttach}>
                        Attach
                      </button>
                      <button type="button" onClick={() => setAttach(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <textarea
              value={input}
              placeholder={
                phase === 'error'
                  ? 'Harness unreachable — reconnect to chat'
                  : readOnlyAgent
                  ? `Viewing ${readOnlyAgent}'s chat — start a new chat to write`
                  : 'Ask about the tree…'
              }
              disabled={phase === 'error' || !!readOnlyAgent}
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
              <button
                onClick={send}
                disabled={phase === 'error' || !!readOnlyAgent || !input.trim()}
              >
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
