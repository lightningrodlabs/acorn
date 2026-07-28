import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useSelector, useStore } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import ChatStackItem from './ChatStackItem'

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
  getSessionMessages,
  getSessionPlanSnapshots,
  listScopedSessions,
  migrateSession,
  moveSession,
  reclaimSessions,
  pruneEmptySessions,
  reusableEmptySessionId,
  scopeProject,
  setSessionArchived,
  subscribeChatHistory,
} from '../../harness/chatHistory'
import { getSessionRegistry, LiveSession } from '../../harness/sessionRegistry'
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

// The in-app LLM chat (LLM-direct-API branch). The panel IS the project's chat
// list (multi-chat-panes): every non-archived chat renders as an item in one
// always-visible stack — collapsed items are their own history rows, expanded
// items are live chats — so there is no separate picker and no privileged
// "displayed" session. Per-session live state (transport handle, busy flag,
// streaming transcript, plan, activity clock) lives in the session registry,
// NOT here, so several sessions run turns at once and collapsing, archiving, or
// switching projects never cancels, blocks, or hides a running turn. The only
// panel-level chat controls are ＋ (new chat) and the archive view (restore /
// delete live there — a stack item can only be archived, never deleted).

// The chat is a right-docked, full-height panel that pushes the map aside rather
// than floating over it. Only its WIDTH is user-adjustable (drag the left edge).
// While open the width is published as `--acorn-chat-width` on <html>, which the
// map canvas subtracts from its own width (see MapView.scss) so the tree reflows
// into the space left of the panel and nothing is ever hidden behind it.
// The global key is the default for projects without a saved layout; the pane
// width proper persists per project (see PanelLayout).
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

// Per-project pane layout: which chats are expanded and the pane width, so a
// reload restores the workspace as it was left. (The stack's membership isn't
// layout — it IS the chat store, minus archived chats.)
interface PanelLayout {
  width?: number
  expanded?: string[]
}
const layoutKey = (projectId: string) => `acorn:harnessChat:layout:${projectId}`
const loadLayout = (projectId: string | null): PanelLayout => {
  if (!projectId) return {}
  try {
    return JSON.parse(localStorage.getItem(layoutKey(projectId)) || '{}')
  } catch (_) {
    return {}
  }
}
const saveLayout = (projectId: string, layout: PanelLayout) => {
  try {
    localStorage.setItem(layoutKey(projectId), JSON.stringify(layout))
  } catch (_) {}
}
const widthFor = (projectId: string | null): number => {
  const w = loadLayout(projectId).width
  return typeof w === 'number' && Number.isFinite(w)
    ? clampWidth(w)
    : loadWidth()
}

// Friendly display label for an agent identifier. The raw value is the stable
// storage/identity key (an ACP `agentInfo.name` — e.g. the verbose package spec
// "@agentclientprotocol/claude-agent-acp", or "OpenCode"); this only changes
// what the stack shows. Unknown agents fall back to the last path segment, so
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

// Compact relative time for collapsed rows and the archive view.
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

/** One chat in the stack (or the archive view), derived from the chat store
 *  plus any live-only registry sessions that have no stored record yet. */
interface ChatRow {
  id: string
  agentName: string | null
  /** owned by the attached backend → resumable/writable here */
  mine: boolean
  title: string
  updatedAt: number
  archivedAt?: number
  /** stored transcript — the render fallback when the row isn't live */
  messages: ChatMessage[]
}

const HarnessChat: React.FC = () => {
  const projectPage = useRouteMatch<{ projectId: CellIdString }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : null
  const store = useStore()
  const registry = getSessionRegistry()

  // the project whose chats the panel is showing. Chats are per-project;
  // switching projects swaps the whole stack (background sessions keep
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
  // The stack: every non-archived chat of this project, one row each. Rows are
  // refreshed from the store on membership changes, not derived per render —
  // parsing every stored transcript on each streamed chunk would be waste.
  const [rows, setRows] = useState<ChatRow[]>([])
  // Stable stack order: existing rows keep their position while turns stream
  // (re-sorting by updatedAt would make concurrently-streaming chats trade
  // places on every chunk); new chats enter at the top.
  const orderRef = useRef<string[]>([])
  // which chats are expanded (the rest render as their own history rows)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  // Layout persistence gate: the saved expanded set must not be clobbered by
  // the empty pre-restore state (mount / project switch).
  const layoutLoadedRef = useRef(false)
  // The session the human last touched (focused or sent on) — the routing
  // fallback for hosted tool calls that arrive unattributed. With no privileged
  // "displayed" chat, last-interacted is the best stand-in for "the chat the
  // human means". The draft-interlock stamp still never guesses (see connect).
  const lastInteractedRef = useRef<string | null>(null)
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'ready' | 'error'>(
    'idle'
  )
  const [error, setError] = useState('')
  // The in-panel "attach conversation" picker (null = closed). Replaces
  // window.prompt/confirm, which this webview doesn't support: it holds the
  // computed target + a human-editable override before the propose_edits draft.
  const [attach, setAttach] = useState<{
    sessionId: string
    title: string
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
  // whether a chat textarea owns the keyboard — when true, the tree's global
  // shortcuts (Enter/arrows/Backspace) are suppressed so typing never disturbs
  // the tree. Mirrored into redux so the suppression is enforced globally.
  const [focused, setFocused] = useState(false)
  // the header's archive view (restore / delete live there)
  const [showArchived, setShowArchived] = useState(false)
  const [archivedRows, setArchivedRows] = useState<ChatRow[]>([])
  // MCP servers the agent can reach this session (e.g. "linear"), from initialize
  const [mcpServers, setMcpServers] = useState<string[]>([])

  // Re-render on ANY registry change: every expanded item's stream, plus the
  // live dots on collapsed rows.
  const [, setRenderTick] = useState(0)
  useEffect(() => registry.subscribe(() => setRenderTick((n) => n + 1)), [])
  // While any turn is in flight anywhere, tick once a second so the stall
  // clocks (banners + dots) advance even when no updates arrive — the whole
  // point of a stall is that nothing else triggers a render.
  const anyBusy = registry.anyBusy()
  useEffect(() => {
    if (!anyBusy) return
    const t = setInterval(() => setRenderTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [anyBusy])

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
  // right edge and spans the full viewport height. Per-project, with the global
  // key as the default for projects without a saved layout.
  const [width, setWidth] = useState<number>(() => widthFor(projectId))

  // Close the archive view on any click outside it.
  const archRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(archRef, () => setShowArchived(false))

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

  // Switching projects: swap to the new project's own stack. Registry sessions
  // are untouched — a background turn keeps streaming while the human works in
  // another project, and switching back re-lists it live.
  useEffect(() => {
    if (projectRef.current === projectId) return
    projectRef.current = projectId
    connectingRef.current = false
    setAttach(null)
    setError('')
    setShowArchived(false)
    setKeyboardOwnership(false)
    // Gate persistence before emptying, so the in-between state never
    // overwrites the layout we're about to restore for the new project.
    layoutLoadedRef.current = false
    orderRef.current = []
    setRows([])
    setArchivedRows([])
    setExpandedIds(new Set())
    setWidth(widthFor(projectId))
    setPhase('idle') // open is left as-is; auto-connect picks up the new project
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Persist this project's pane layout (width + expanded chats) whenever it
  // changes — but only once the saved layout has been restored, so the
  // pre-restore empty state can't clobber it.
  useEffect(() => {
    if (!projectId || !layoutLoadedRef.current) return
    saveLayout(projectId, { width, expanded: [...expandedIds] })
  }, [projectId, width, expandedIds])

  // Keep the stack (and open archive view) fresh under concurrent writers
  // ([[chat-history-concurrency]]): another session persisting in this window,
  // or another window on this project. Leading-edge throttled — persists arrive
  // per streamed chunk, and re-reading every stored transcript at that rate is
  // waste; the stack's membership only changes rarely.
  const refreshRowsRef = useRef<() => void>(() => {})
  useEffect(() => {
    if (!projectId) return
    let cooling = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsub = subscribeChatHistory((scoped) => {
      if (scoped !== projectId && scoped.indexOf(projectId + '::') !== 0) return
      if (cooling) return
      cooling = true
      refreshRowsRef.current()
      timer = setTimeout(() => {
        cooling = false
      }, 400)
    })
    return () => {
      unsub()
      if (timer) clearTimeout(timer)
    }
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

  // Is this scope the backend we're attached to (so its chats are resumable)?
  const isCurrentAgent = (agentName: string | null) =>
    (agentName || null) === (agentNameRef.current || null)

  // Every chat of this project, one row each: stored records (across all agent
  // scopes) plus live-only registry sessions that have no record yet (a
  // brand-new chat isn't persisted until its first message).
  const computeRows = (): { active: ChatRow[]; archived: ChatRow[] } => {
    const active: ChatRow[] = []
    const archived: ChatRow[] = []
    for (const g of listScopedSessions(projectId)) {
      for (const s of g.sessions) {
        const row: ChatRow = {
          id: s.id,
          agentName: g.agentName,
          mine: isCurrentAgent(g.agentName),
          title: s.title,
          updatedAt: s.updatedAt,
          ...(s.archivedAt ? { archivedAt: s.archivedAt } : {}),
          messages: s.messages,
        }
        ;(s.archivedAt ? archived : active).push(row)
      }
    }
    for (const e of registry.list(projectId)) {
      if (!isCurrentAgent(e.agentName)) continue
      if (active.some((r) => r.id === e.id)) continue
      if (archived.some((r) => r.id === e.id)) continue
      active.push({
        id: e.id,
        agentName: e.agentName,
        mine: true,
        title: deriveTitle(e.messages),
        updatedAt: Date.now(),
        messages: e.messages,
      })
    }
    return { active, archived }
  }

  // Stable-order the active rows (see orderRef) and publish both lists.
  const refreshRows = () => {
    const { active, archived } = computeRows()
    const byId = new Map(active.map((r) => [r.id, r]))
    const kept = orderRef.current.filter((id) => byId.has(id))
    const fresh = active
      .filter((r) => kept.indexOf(r.id) < 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((r) => r.id)
    orderRef.current = [...fresh, ...kept]
    setRows(orderRef.current.map((id) => byId.get(id) as ChatRow))
    setArchivedRows(archived.sort((a, b) => b.updatedAt - a.updatedAt))
  }
  refreshRowsRef.current = refreshRows

  // Make `target` LIVE in the registry: if it already is (e.g. mid-turn in the
  // background), it is returned untouched — re-resuming would do nothing useful
  // and must not disturb its stream. Else resume `target` if given and the host
  // still has it (live reattach, or ACP session/load across a restart), else
  // start fresh; the transcript is restored from the local store into the new
  // registry entry (under a NEW id when it had to migrate).
  const ensureLive = async (
    target: string | null
  ): Promise<{ id: string; wasLive: boolean }> => {
    const live = target ? registry.get(target) : undefined
    if (live && live.projectId === projectId)
      return { id: live.id, wasLive: true }
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
    return { id: session.id, wasLive: false }
  }

  // Expand/collapse a row. Expanding one of OUR chats resumes it live first
  // (lazy — collapsed rows never hold a session open); a foreign chat just
  // shows its stored transcript. Collapsing only hides the view: the session
  // and any running turn are untouched.
  const toggleExpand = async (row: ChatRow) => {
    if (expandedIds.has(row.id)) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.delete(row.id)
        return next
      })
      return
    }
    let id = row.id
    if (row.mine && phase === 'ready' && !registry.get(row.id)) {
      id = (await ensureLive(row.id)).id
      if (id !== row.id) refreshRows() // the transcript migrated to a fresh id
    }
    setExpandedIds((prev) => new Set(prev).add(id))
  }

  // ＋ — the only panel-level chat-creation control. Reuses an existing empty
  // chat (live or stored) rather than piling up unused sessions.
  const newChat = async () => {
    const liveEmpty = registry
      .list(projectId)
      .find(
        (e) => isCurrentAgent(e.agentName) && !e.busy && e.messages.length === 0
      )
    const target = liveEmpty ? liveEmpty.id : reusableEmptySessionId(chatKey())
    const { id } = await ensureLive(target)
    pruneEmptySessions(chatKey(), id)
    setExpandedIds((prev) => new Set(prev).add(id))
    refreshRows()
  }

  // Archive a chat: it leaves the stack but keeps its record — restorable (and
  // only deletable) from the header's archive view. Mid-turn archiving is
  // blocked (the menu disables it): the stream would keep persisting under a
  // chat the human just dismissed.
  const archiveChat = (row: ChatRow) => {
    if (registry.get(row.id)?.busy) return
    registry.remove(row.id)
    setSessionArchived(
      scopeProject(projectId, row.agentName),
      row.id,
      true,
      Date.now()
    )
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(row.id)
      return next
    })
    refreshRows()
  }

  const restoreChat = (row: ChatRow) => {
    setSessionArchived(
      scopeProject(projectId, row.agentName),
      row.id,
      false,
      Date.now()
    )
    refreshRows()
  }

  // Permanent delete — only reachable from the archive view, so a transcript is
  // never one mis-click from gone.
  const deleteArchived = (row: ChatRow) => {
    if (registry.get(row.id)?.busy) return
    registry.remove(row.id)
    deleteSession(scopeProject(projectId, row.agentName), row.id)
    refreshRows()
  }

  // Agents a chat can be re-homed to: the attached backend plus any other
  // backend that already owns chats here, minus the chat's current owner.
  const moveTargets = (fromAgent: string | null): string[] =>
    Array.from(
      new Set(
        [agentNameRef.current, ...rows.map((r) => r.agentName)].filter(
          (a): a is string => !!a && a !== (fromAgent || null)
        )
      )
    )
  const doMove = (row: ChatRow, toAgent: string) => {
    // a mid-turn session keeps persisting under its own scope, which would
    // immediately undo the move — finish or cancel the turn first
    if (registry.get(row.id)?.busy) return
    registry.remove(row.id)
    moveSession(projectId, row.agentName, toAgent, row.id)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(row.id)
      return next
    })
    refreshRows()
  }

  // Restore this project's workspace: rows from the store, the saved expanded
  // set (lazily resuming each expanded chat), and any turn still running on the
  // host adopted AND expanded — a stream you left running belongs on screen.
  const restoreLayout = async () => {
    const saved = loadLayout(projectId)
    const { active } = computeRows()
    const expanded = new Set<string>()
    for (const target of saved.expanded || []) {
      const row = active.find((r) => r.id === target)
      if (!row) continue
      if (row.mine && !registry.get(row.id)) {
        try {
          expanded.add((await ensureLive(row.id)).id)
        } catch (_) {} // the host lost it and the resume path failed — skip
      } else {
        expanded.add(row.id)
      }
    }
    for (const e of registry.list(projectId))
      if (e.busy && isCurrentAgent(e.agentName)) expanded.add(e.id)
    setExpandedIds(expanded)
    layoutLoadedRef.current = true
    refreshRows()
  }

  // A turn started before a renderer reload is still running on the HOST — the
  // sidecar keeps the agent (and the ACP session) alive across the socket drop.
  // Ask which sessions are mid-turn and adopt each one, so its output lands in
  // its own transcript as it arrives instead of being lost until someone happens
  // to expand that chat. Only THIS project's chats under the CURRENT agent are
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
      // the caller is not necessarily in the displayed PROJECT); unattributed
      // calls fall back to the single busy session, then to the chat the human
      // last interacted with.
      client.onToolCall?.((call, sessionId) => {
        // Two distinct identities come out of attribution:
        //   attributed — a session we can actually pin the call on (the host
        //     said so, or exactly one turn is in flight anywhere). Feeds the
        //     draft interlock stamp, so it must never guess.
        //   routed — attributed, else the last-interacted session: the best
        //     project to serve the call from when we can't tell the caller.
        const attributed = registry.get(sessionId) || registry.soleBusy()
        const routed = attributed || registry.get(lastInteractedRef.current)
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
      // stdio). Set synchronously so everything below reads the right space.
      agentNameRef.current = info.agentName || null
      // Reclaim any of THIS backend's chats that earlier ended up in another
      // scope (e.g. pre-stamp data, or a chat opened under the wrong agent), and
      // backfill author stamps. Idempotent; only touches unstamped records.
      reclaimSessions(projectId, agentNameRef.current)
      setMcpServers(info.mcpServers || [])
      await reattachInFlight()
      await restoreLayout()
      // an empty project starts with one open chat ready to type into
      if (computeRows().active.length === 0) await newChat()
      setPhase('ready')
    } catch (e: any) {
      setPhase('error')
      setError(e?.message || String(e))
      // Harness is unreachable, but the transcripts are stored locally — the
      // stack still lists them (read-only: no live entries can exist, so
      // nothing here can persist over the saved records).
      layoutLoadedRef.current = true
      refreshRows()
    } finally {
      connectingRef.current = false
    }
  }
  // expose the latest connect to the auto-connect effect
  connectRef.current = connect

  // Run one turn on `sess`, from whichever item it came. Captures the selection
  // AT SEND TIME and pins it on the user turn: it is the conversation's
  // ask-time anchor, and must not be re-read later (the human moves the
  // selection while the agent works). The turn's context is the current tree
  // (only if it changed since THIS session last saw it — keeps the agent
  // current without resending a large unchanged tree) + the live selection (so
  // "this"/"these" resolve) + the user's text last.
  const sendTurn = async (sess: LiveSession, text: string) => {
    if (!text || sess.busy) return
    lastInteractedRef.current = sess.id
    const liveState = store.getState() as any
    const selected = readSelection(liveState, sess.projectId)
    registry.appendMessage(sess.id, 'user', text, selected)
    const snapshot = readTree(liveState, sess.projectId)
    const prev = registry.lastTree(sess.id) as ProjectSnapshot | null
    const treeChanged =
      !prev || !isEmptyDiff(computeProjectDiff(prev, snapshot))
    const blocks: HarnessContentBlock[] = []
    if (treeChanged) {
      blocks.push({
        type: 'resource',
        uri: `acorn://tree/${sess.projectId}`,
        mimeType: 'application/json',
        text: JSON.stringify(snapshot),
      })
      if (prev) registry.appendMessage(sess.id, 'system', '↻ sent updated tree')
      registry.markTreeSent(sess.id, snapshot)
    }
    if (selected.length)
      blocks.push({ type: 'text', text: selectionNote(selected) })
    blocks.push({ type: 'text', text })
    // The turn streams into the session's registry entry whether or not its
    // item stays expanded — collapsing neither cancels nor hides it.
    await registry.runTurn(sess.id, blocks)
  }

  // Attach a chat's captured conversation to the branch it shaped, as a
  // conversation artifact — via the propose_edits draft (human confirms). The
  // target is computed (LCA of edited nodes; else the first-turn ask-time
  // anchor; root-LCA asks first), never the live selection.
  // Human-readable one-liner for a node: "[handle] first 60 chars of content".
  const describeNode = (tree: any, hash: string): string => {
    const o = tree?.outcomes?.[hash]
    if (!o) return hash
    const label = nodeDisplayLabel({
      actionHash: hash,
      description: o.description,
    })
    return `[${label}] ${(o.content || '').slice(0, 60)}`
  }

  // Open the attach picker for one chat (from its ⋯ menu): compute the default
  // target and show it for the human to accept or override. The chat is
  // resumed live first so the transcript captured is the current one.
  const openAttach = async (row: ChatRow) => {
    if (!row.mine) return
    const { id } = await ensureLive(row.id)
    const entry = registry.get(id)
    if (!entry) return
    const title = deriveTitle(entry.messages)
    const transcript = buildTranscript(
      {
        id: entry.id,
        title,
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
      sessionId: entry.id,
      title,
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
        (a) =>
          a.type === 'conversation-ref' && (a.uri || '').trim() === holderRef
      )
      nextArtifacts = already
        ? fields.artifacts || []
        : [
            ...(fields.artifacts || []),
            makeConversationReference(holderRef, attach.title),
          ]
    } else {
      // Full canonical copy — upsert by sessionId (grow, never duplicate).
      const artifact = makeConversationArtifact(attach.title, transcript)
      nextArtifacts = upsertConversationArtifact(fields.artifacts, artifact)
    }

    const updatedOutcome = {
      ...outcome,
      description: serializeFields({ ...fields, artifacts: nextArtifacts }),
    }
    // Stamped with the ATTACHING session: attaching ITS conversation is an act
    // of that session, so the draft interlock treats it as the same proposer.
    const res = await handleAcornToolCall(
      store,
      projectId,
      {
        tool: 'propose_edits',
        args: {
          diff: {
            outcomes: { updated: { [chosen as string]: updatedOutcome } },
          },
        },
      },
      attach.sessionId
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
        <button
          className="harness-chat-icon-btn"
          aria-label="New chat"
          title="New chat"
          disabled={phase !== 'ready'}
          onClick={newChat}
        >
          ＋
        </button>
        <div
          className="harness-chat-archive-wrap"
          ref={archRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="harness-chat-icon-btn"
            aria-label="Archived chats"
            title="Archived chats"
            onClick={() => {
              refreshRows()
              setShowArchived((s) => !s)
            }}
          >
            🗂
          </button>
          {showArchived && (
            <div className="harness-chat-archived">
              {archivedRows.length === 0 && (
                <div className="arch-empty">No archived chats</div>
              )}
              {archivedRows.map((r) => (
                <div key={r.id} className="arch-row">
                  <span className="arch-title" title={r.title}>
                    {r.title}
                    {!r.mine && (
                      <span className="chat-item-agent">
                        {prettyAgent(r.agentName)}
                      </span>
                    )}
                  </span>
                  <span className="arch-time">
                    {relativeTime(r.updatedAt, Date.now())}
                  </span>
                  <button
                    className="arch-restore"
                    aria-label="Restore chat"
                    title="Restore to the stack"
                    onClick={() => restoreChat(r)}
                  >
                    ↩
                  </button>
                  <button
                    className="arch-del"
                    aria-label="Delete chat"
                    title="Delete permanently"
                    onClick={() => deleteArchived(r)}
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
            <span className="more">
              &nbsp;(+{selectedNodes.length - 1} more)
            </span>
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

      {attach && (
        <div className="harness-chat-attach">
          <div className="harness-chat-attach-panel">
            <div className="attach-target">
              Attach “{attach.title}”{' '}
              {attach.target ? (
                <>
                  to <strong>{attach.label}</strong>
                  <span className="attach-why">
                    {attach.reason === 'anchor'
                      ? ' — the node open when this conversation began'
                      : attach.reason === 'prompt'
                      ? ' — this touched unrelated branches (tree root); pick a real node below'
                      : ' — the branch this session shaped'}
                  </span>
                </>
              ) : (
                <>— no target could be computed; type a node below.</>
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
                  . A link to it will be attached here instead of a second copy.
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
        </div>
      )}

      {(phase === 'ready' || phase === 'error') && (
        <div className="chat-stack">
          {rows.length === 0 && (
            <div className="chat-stack-empty">
              No chats yet —{' '}
              <button onClick={newChat} disabled={phase !== 'ready'}>
                ＋ start one
              </button>
            </div>
          )}
          {rows.map((row) => {
            const entry = registry.get(row.id)
            return (
              <ChatStackItem
                key={row.id}
                title={entry ? deriveTitle(entry.messages) : row.title}
                timeLabel={relativeTime(row.updatedAt, Date.now())}
                agentLabel={row.mine ? null : prettyAgent(row.agentName)}
                readOnly={!row.mine}
                entry={entry}
                storedMessages={row.messages}
                expanded={expandedIds.has(row.id)}
                canSend={phase === 'ready' && row.mine && !!entry}
                onToggleExpand={() => toggleExpand(row)}
                onSend={(text) => {
                  const live = registry.get(row.id)
                  if (live) sendTurn(live, text)
                }}
                onKeyboard={setKeyboardOwnership}
                onInteract={() => {
                  lastInteractedRef.current = row.id
                }}
                menu={{
                  ...(row.mine ? { onAttach: () => openAttach(row) } : {}),
                  onArchive: () => archiveChat(row),
                  archiveDisabled: !!registry.get(row.id)?.busy,
                  moveTargets: moveTargets(row.agentName),
                  onMove: (toAgent) => doMove(row, toAgent),
                  prettyAgent,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HarnessChat
