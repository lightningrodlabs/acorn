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
  deriveTitle,
  deleteSession,
  getCurrentId,
  getSessionMessages,
  getSessionPlanSnapshots,
  listScopedSessions,
  migrateSession,
  moveSession,
  reclaimSessions,
  pruneEmptySessions,
  reusableEmptySessionId,
  scopeProject,
  setCurrentSession,
  SessionGroup,
} from '../../harness/chatHistory'
import { getSessionRegistry } from '../../harness/sessionRegistry'
import {
  computeProjectDiff,
  isEmptyDiff,
  ProjectSnapshot,
} from '../../migrating/projectDiff'
import { setTextInputFocused } from '../../redux/ephemeral/keyboard/actions'
import { askConfirm } from '../AskDialog/AskDialog'
import {
  getHarnessClient,
  HarnessContentBlock,
  HarnessPermissionDecision,
  HarnessPermissionRequest,
  HarnessSessionInfo,
} from '../../harness'

// The in-app LLM chat (LLM-direct-API branch), as a VIEW over the session
// registry (concurrent-sessions branch, leaf: session-registry). Per-session
// live state — transport handle, busy flag, streaming transcript, plan,
// activity clock — lives in the registry, NOT here, so several sessions can
// run turns at once: switching the displayed session (or project) never
// cancels, blocks, or hides a running turn, and a background turn keeps
// streaming into its own entry. Each turn carries the live read_tree snapshot
// (resent only when it changed since that session last saw it) plus the
// current selection.

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

// On a permission request, allow/reject via a confirm for the slice. (The
// attention-inbox leaf will queue these per-session instead of one global
// modal; until then a background session's request still lands here.)
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
  const ok = await askConfirm({
    heading: 'Agent permission request',
    // the dialog renders markdown — fence the command so it reads as code
    message:
      'The agent is requesting permission to:\n\n```\n' +
      (req.toolCall.title || 'act') +
      '\n```',
    confirmLabel: 'Allow',
    cancelLabel: 'Reject',
  })
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
  const registry = getSessionRegistry()

  // the project the DISPLAYED chat belongs to. Chats are per-project by default;
  // switching projects resets the panel display (background sessions keep
  // streaming in the registry — see the switch effect below).
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
  // which registry session the panel is showing (null = none, e.g. while
  // connecting or when viewing a foreign agent's chat read-only). The ref
  // mirrors it for the client-level tool-routing closure.
  const [displayedId, setDisplayedId] = useState<string | null>(null)
  const displayedIdRef = useRef<string | null>(null)
  displayedIdRef.current = displayedId
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'ready' | 'error'>(
    'idle'
  )
  const [error, setError] = useState('')
  // Transcript shown when NO live entry is displayed: a foreign agent's chat
  // opened read-only, or the last chat surfaced while the harness is
  // unreachable. Ignored whenever a live entry is displayed.
  const [viewMessages, setViewMessages] = useState<ChatMessage[]>([])
  // Agent-message ids whose reasoning ("Thinking") block the user has expanded.
  // The in-flight message auto-expands while busy (see the transcript render);
  // this set holds explicit toggles, so completed turns stay collapsed until
  // opened. Reset whenever we swap the visible transcript (ids are reused).
  const [openThinking, setOpenThinking] = useState<Set<number>>(new Set())
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

  // Re-render on ANY registry change: the displayed entry's stream, but also
  // background sessions (their status shows in the history picker).
  const [, setRenderTick] = useState(0)
  useEffect(() => registry.subscribe(() => setRenderTick((n) => n + 1)), [])
  // While any turn is in flight anywhere, tick once a second so the stall
  // clocks (banner + picker dots) advance even when no updates arrive — the
  // whole point of a stall is that nothing else triggers a render.
  const anyBusy = registry.anyBusy()
  useEffect(() => {
    if (!anyBusy) return
    const t = setInterval(() => setRenderTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [anyBusy])

  // --- the displayed session, derived from the registry every render ---
  const entry = displayedId ? registry.get(displayedId) : undefined
  const messages: ChatMessage[] = entry ? entry.messages : viewMessages
  const busy = !!(entry && entry.busy)
  const plan = entry ? entry.plan : []
  const activity = entry ? entry.activity : ''
  const idleSecs =
    busy && entry
      ? Math.max(0, Math.floor((Date.now() - entry.activityAt) / 1000))
      : 0

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

  // Switching projects: reset the panel DISPLAY back to idle and reconnect to
  // the new project's own current chat. Registry sessions are untouched — a
  // background turn keeps streaming while the human works in another project,
  // and switching back re-displays it live (openSession's registry shortcut).
  useEffect(() => {
    if (projectRef.current === projectId) return
    projectRef.current = projectId
    connectingRef.current = false
    setDisplayedId(null)
    setViewMessages([])
    setOpenThinking(new Set())
    setAttach(null)
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

  if (!projectId) return null
  const client = getHarnessClient()
  // No harness host in this context (prod build / Moss without the affordance).
  if (!client.available) return null

  const toggleThinking = (id: number) =>
    setOpenThinking((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Attach to a session and display it. If the session is already LIVE in the
  // registry (e.g. it's mid-turn in the background), just swap the view to it —
  // re-resuming would do nothing useful and must not disturb its stream. Else
  // resume `target` if given and the host still has it (live reattach, or ACP
  // session/load across a restart), else start fresh; the transcript is
  // restored from the local store into the new registry entry.
  const openSession = async (target: string | null) => {
    setReadOnlyAgent(null) // leaving any read-only foreign-agent view
    setViewMessages([])
    setOpenThinking(new Set()) // ids are reused across sessions — drop stale toggles
    const live = target ? registry.get(target) : undefined
    if (live && live.projectId === projectId) {
      setDisplayedId(live.id)
      setCurrentSession(chatKey(), live.id)
      return
    }
    let session = null as Awaited<ReturnType<typeof client.newSession>> | null
    let restored: ChatMessage[] = []
    let restoredPlans = [] as ReturnType<typeof getSessionPlanSnapshots>
    if (target && client.resumeSession) {
      try {
        session = await client.resumeSession(target)
        restored = getSessionMessages(chatKey(), target)
        restoredPlans = getSessionPlanSnapshots(chatKey(), target)
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
      restored = target
        ? migrateSession(
            chatKey(),
            target,
            session.id,
            Date.now(),
            agentNameRef.current
          )
        : []
      restoredPlans = target
        ? getSessionPlanSnapshots(chatKey(), session.id)
        : []
    }
    // A fresh registry entry starts with lastTree = null, so the next turn
    // re-sends the full current tree (read_tree) to the (re)attached session.
    registry.open({
      id: session.id,
      projectId,
      chatKey: chatKey(),
      agentName: agentNameRef.current,
      session,
      messages: restored,
      planSnapshots: restoredPlans,
    })
    setDisplayedId(session.id)
    setCurrentSession(chatKey(), session.id)
    // keep at most one empty chat — discard any unused ones we left behind
    pruneEmptySessions(chatKey(), session.id)
  }

  // A turn started before a renderer reload is still running on the HOST — the
  // sidecar keeps the agent (and the ACP session) alive across the socket drop.
  // Ask which sessions are mid-turn and adopt each one, so its output lands in
  // its own transcript as it arrives instead of being lost until someone happens
  // to click that chat. Only THIS project's chats under the CURRENT agent are
  // candidates: another agent's session ids can't be resumed here, and another
  // project's session belongs to that project's panel.
  const reattachInFlight = async () => {
    if (!client.listSessions || !client.resumeSession) return
    let held: HarnessSessionInfo[]
    try {
      held = await client.listSessions()
    } catch (_) {
      return // an older host without the sessions query — nothing to adopt
    }
    const mine = listScopedSessions(projectId).find((g) =>
      isCurrentAgent(g.agentName)
    )
    const known = new Set((mine ? mine.sessions : []).map((s) => s.id))
    for (const info of held) {
      if (!info.inFlight || !known.has(info.sessionId)) continue
      if (registry.get(info.sessionId)?.busy) continue // already streaming here
      if (!registry.get(info.sessionId)) {
        try {
          const session = await client.resumeSession(info.sessionId)
          registry.open({
            id: session.id,
            projectId,
            chatKey: chatKey(),
            agentName: agentNameRef.current,
            session,
            messages: getSessionMessages(chatKey(), info.sessionId),
            planSnapshots: getSessionPlanSnapshots(chatKey(), info.sessionId),
          })
        } catch (_) {
          continue // the host lost it between the query and the resume
        }
      }
      registry.adoptTurn(info.sessionId)
    }
  }

  const connect = async () => {
    if (connectingRef.current || phase === 'ready') return
    connectingRef.current = true
    setPhase('connecting')
    setError('')
    try {
      client.onPermissionRequest(decidePermission)
      // Hosted callable tools (read_tree / propose_edits). propose_edits opens an
      // inert draft for human review — it never writes to the DHT (L1). The call
      // routes to the session the HOST attributed it to (concurrent sessions:
      // the caller is not necessarily the displayed session, nor even the
      // displayed PROJECT); unattributed calls fall back to the single busy
      // session, then to whatever is displayed.
      client.onToolCall?.((call, sessionId) => {
        // Two distinct identities come out of attribution:
        //   attributed — a session we can actually pin the call on (the host
        //     said so, or exactly one turn is in flight anywhere). Feeds the
        //     draft interlock stamp, so it must never guess.
        //   routed — attributed, else the displayed session: the best project
        //     to serve the call from when we genuinely can't tell the caller.
        const attributed = registry.get(sessionId) || registry.soleBusy()
        const routed = attributed || registry.get(displayedIdRef.current)
        const pid = routed ? routed.projectId : projectRef.current
        if (!pid)
          return Promise.resolve({
            ok: false as const,
            error: 'no project open in Acorn',
          })
        // Track which nodes the session proposes edits to, so the attach control
        // can default to the branch it shaped (LCA of those nodes).
        if (call?.tool === 'propose_edits' && routed) {
          const diff = call.args && call.args.diff ? call.args.diff : call.args
          const outs = (diff && diff.outcomes) || {}
          registry.noteEditedNodes(routed.id, [
            ...Object.keys(outs.updated || {}),
            ...Object.keys(outs.added || {}),
          ])
        }
        return handleAcornToolCall(store, pid, call, attributed?.id)
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
      await reattachInFlight()
      setPhase('ready')
    } catch (e: any) {
      setPhase('error')
      setError(e?.message || String(e))
      // Harness is unreachable, but the transcript is stored locally — surface
      // the last chat so it stays readable (read-only) instead of vanishing
      // behind the error. No displayed entry, so nothing here can persist (and
      // clobber) the saved record.
      const lastId = getCurrentId(chatKey())
      if (lastId) setViewMessages(getSessionMessages(chatKey(), lastId))
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
    if (id !== displayedId) await openSession(id)
  }
  // Open another backend's chat read-only: restore its transcript for reading,
  // but don't attach a session (the attached agent can't resume a foreign ACP
  // id) — input stays disabled until the user starts a chat under this agent.
  const viewSession = (agentName: string | null, id: string) => {
    setShowHistory(false)
    // no displayed entry ⇒ nothing can persist over the stored record
    setDisplayedId(null)
    setViewMessages(getSessionMessages(scopeProject(projectId, agentName), id))
    setOpenThinking(new Set())
    setReadOnlyAgent(prettyAgent(agentName))
  }
  const newChat = async () => {
    setShowHistory(false)
    // already sitting in an unused (and editable) chat — nothing to create
    if (!readOnlyAgent && entry && !entry.busy && entry.messages.length === 0)
      return
    // reuse an existing empty chat if there is one, else start fresh
    await openSession(reusableEmptySessionId(chatKey()))
  }
  const removeChat = async (agentName: string | null, id: string) => {
    // a mid-turn session can't be deleted out from under its stream — its next
    // persist would just resurrect the record, more confusingly
    if (registry.get(id)?.busy) return
    registry.remove(id)
    deleteSession(scopeProject(projectId, agentName), id)
    setSessionGroups(listScopedSessions(projectId))
    // dropped the chat we have open under the current agent → start fresh
    if (isCurrentAgent(agentName) && id === displayedId) await openSession(null)
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
    // as with delete: a mid-turn session keeps persisting under its own scope,
    // which would immediately undo the move — finish or cancel the turn first
    if (registry.get(id)?.busy) return
    registry.remove(id)
    moveSession(projectId, fromAgent, toAgent, id)
    setSessionGroups(listScopedSessions(projectId))
    // moved the open chat out from under the current agent → reset to fresh
    if (isCurrentAgent(fromAgent) && id === displayedId) await openSession(null)
  }

  const send = async () => {
    const text = input.trim()
    if (!entry || entry.busy || !text) return
    setInput('')
    // Capture the selection AT SEND TIME and pin it on the user turn: it is the
    // conversation's ask-time anchor, and must not be re-read later (the human
    // moves the selection while the agent works).
    const liveState = store.getState() as any
    const selected = readSelection(liveState, projectId)
    registry.appendMessage(entry.id, 'user', text, selected)
    // Assemble the turn's context: current tree (only if it changed since THIS
    // session last saw it — keeps the agent current without resending a large
    // unchanged tree) + the live selection (so "this"/"these" resolve) + the
    // user's text last.
    const snapshot = readTree(liveState, projectId)
    const prev = registry.lastTree(entry.id) as ProjectSnapshot | null
    const treeChanged = !prev || !isEmptyDiff(computeProjectDiff(prev, snapshot))
    const blocks: HarnessContentBlock[] = []
    if (treeChanged) {
      blocks.push({
        type: 'resource',
        uri: `acorn://tree/${projectId}`,
        mimeType: 'application/json',
        text: JSON.stringify(snapshot),
      })
      if (prev) registry.appendMessage(entry.id, 'system', '↻ sent updated tree')
      registry.markTreeSent(entry.id, snapshot)
    }
    if (selected.length)
      blocks.push({ type: 'text', text: selectionNote(selected) })
    blocks.push({ type: 'text', text })
    // The turn streams into the session's registry entry whether or not it stays
    // displayed — switching away neither cancels nor hides it.
    await registry.runTurn(entry.id, blocks)
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
    if (!projectId || !entry) return
    const transcript = buildTranscript(
      {
        id: entry.id,
        title: deriveTitle(entry.messages),
        updatedAt: Date.now(),
        messages: entry.messages,
        agentName: entry.agentName || undefined,
        planSnapshots: entry.planSnapshots,
      },
      Date.now()
    )
    // Keep conversation artifacts here: we're upserting one INTO a node's
    // artifacts, so the read must see the node's existing conversations (a
    // stripped read would append a duplicate and drop the prior ones on write).
    const tree = readTree(store.getState() as any, projectId, {
      includeConversations: true,
    })
    const anchor = anchorSelection(transcript)[0]?.actionHash || null
    const { target, reason } = computeAttachTarget({
      tree: tree as any,
      editedNodeIds: [...entry.editedNodes],
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
    // Stamped with the DISPLAYED session: attaching ITS conversation is an act
    // of that session, so the draft interlock treats it as the same proposer.
    const res = await handleAcornToolCall(
      store,
      projectId,
      {
        tool: 'propose_edits',
        args: {
          diff: { outcomes: { updated: { [chosen as string]: updatedOutcome } } },
        },
      },
      displayedIdRef.current || undefined
    )
    if (res.ok === false) {
      const message = res.error
      setAttach((prev) => (prev ? { ...prev, error: message } : prev))
      return
    }
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

  // Live status for a picker row: is that session running a turn right now
  // (anywhere — including in the background while another chat is displayed)?
  const liveStatus = (id: string): 'running' | 'stalled' | null => {
    const live = registry.get(id)
    if (!live || !live.busy) return null
    return Date.now() - live.activityAt >= STALL_SECS * 1000
      ? 'stalled'
      : 'running'
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
          {/* stays enabled while a turn runs — switching sessions mid-turn is
              the whole point of the session registry */}
          <button
            className="harness-chat-icon-btn"
            aria-label="Chat history"
            title="Resume a chat"
            disabled={phase !== 'ready'}
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
                      {g.sessions.map((s) => {
                        const status = mine ? liveStatus(s.id) : null
                        return (
                          <div
                            key={s.id}
                            className={`hist-row${
                              mine && s.id === displayedId ? ' current' : ''
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
                              <span className="hist-title">
                                {status && (
                                  <span
                                    className={`hist-live ${status}`}
                                    title={
                                      status === 'running'
                                        ? 'turn in progress'
                                        : 'no updates for a while — possibly stalled'
                                    }
                                  >
                                    ●{' '}
                                  </span>
                                )}
                                {s.title}
                              </span>
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
                        )
                      })}
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
              <button onClick={() => entry?.session.cancel()}>Stop</button>
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
