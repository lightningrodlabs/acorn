/**
 * Per-project tree-chat history, persisted in localStorage so a chat can be
 * resumed after a reload (and, when the agent supports ACP session/load, after a
 * full restart). Stores multiple sessions per project plus which one is current,
 * so the header can offer a "resume a particular chat" picker.
 *
 * The pure transforms (deriveTitle / upsertSession / removeSession / listSessions)
 * are unit-tested; the localStorage I/O is a thin wrapper around them.
 */
export type ChatRole = 'user' | 'agent' | 'system'

/**
 * A tool the agent invoked within a turn (ACP `tool_call` update), retained on
 * the message it belongs to. Captured structurally — separate from the message
 * text — so the transcript can preserve *which* tools ran (and, via the title,
 * which were `propose_edits`) rather than only the prose around them. `status`
 * is the last status seen for that `id` (ACP sends progressive updates).
 */
export interface ChatToolCall {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  kind?: string
}

/**
 * A node reference captured at the moment a message was sent — the "ask-time"
 * selection. Mirrors readTree's SelectedNode (actionHash is the stable identity;
 * id is its short hashCodeId). Pinned on the turn so the conversation's anchor
 * survives the human navigating elsewhere while the agent works.
 */
export interface ChatSelection {
  actionHash: string
  id: string
  content?: string
}

/** One agent-plan update (ACP `plan`), as captured for the transcript. */
export interface PlanSnapshot {
  at: number
  entries: { content: string; priority: string; status: string }[]
}

export interface ChatMessage {
  id: number
  role: ChatRole
  text: string
  /**
   * When this message was created (ms epoch). Lets a captured transcript carry a
   * per-turn timestamp. Optional: legacy records written before stamping have
   * none, and the transcript simply omits the timestamp for those turns.
   */
  at?: number
  /**
   * The agent's reasoning stream for this message (ACP `agent_thought_chunk`s),
   * accumulated alongside `text`. Kept on the message so it persists with the
   * transcript and can be re-read after the turn, rather than vanishing when the
   * live "thinking…" indicator clears. Only ever set on `agent` messages, and
   * only for backends/models that emit reasoning chunks.
   */
  thinking?: string
  /**
   * Tool calls the agent made during this message's turn (ACP `tool_call`
   * updates), kept newest-status-wins per tool id. Only set on `agent` messages
   * that invoked tools.
   */
  toolCalls?: ChatToolCall[]
  /**
   * The node(s) selected when this message was sent (ask-time selection). Only
   * set on `user` messages, and only when something was selected. Lets a captured
   * transcript carry the conversation's anchor independent of later navigation.
   */
  selection?: ChatSelection[]
}

export interface SessionRecord {
  id: string
  title: string
  updatedAt: number
  messages: ChatMessage[]
  /**
   * The backend that minted this chat's ACP session id, recorded at write time.
   * This is the authoritative source of truth for which agent owns a chat — it
   * makes grouping and migration work for *any* backend (it's just a label) and
   * removes all guessing. Optional only for legacy records written before
   * stamping existed; [[reclaimSessions]] backfills those.
   */
  agentName?: string
  /**
   * The agent's plan over the life of this session, one snapshot per ACP `plan`
   * update (which replaces wholesale). Session-level, not per-turn, because a
   * plan update is not attached to any single message. Optional; absent for
   * sessions/backends that never emitted a plan.
   */
  planSnapshots?: PlanSnapshot[]
}

export interface ChatStore {
  currentId: string | null
  sessions: SessionRecord[]
}

export const emptyStore = (): ChatStore => ({ currentId: null, sessions: [] })

/** A short label for a session — its first non-empty user message. */
export function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.text.trim())
  const t = (firstUser ? firstUser.text : '').trim().replace(/\s+/g, ' ')
  if (!t) return 'New chat'
  return t.length > 60 ? t.slice(0, 57) + '…' : t
}

/** Insert or replace a session's record and mark it current. Stamps the owning
 *  agent: an explicit `agentName` wins, else a prior record's stamp is kept. */
export function upsertSession(
  store: ChatStore,
  id: string,
  messages: ChatMessage[],
  now: number,
  agentName?: string | null,
  planSnapshots?: PlanSnapshot[] | null
): ChatStore {
  const prev = store.sessions.find((s) => s.id === id)
  const owner = agentName || prev?.agentName
  // Prefer explicitly-passed snapshots; else keep whatever the prior record held
  // (so a persist that doesn't re-supply them doesn't drop them).
  const plans = planSnapshots != null ? planSnapshots : prev?.planSnapshots
  const record: SessionRecord = {
    id,
    title: deriveTitle(messages),
    updatedAt: now,
    messages,
    ...(owner ? { agentName: owner } : {}),
    ...(plans && plans.length ? { planSnapshots: plans } : {}),
  }
  const sessions = prev
    ? store.sessions.map((s) => (s.id === id ? record : s))
    : [...store.sessions, record]
  return { currentId: id, sessions }
}

export function removeSession(store: ChatStore, id: string): ChatStore {
  return {
    currentId: store.currentId === id ? null : store.currentId,
    sessions: store.sessions.filter((s) => s.id !== id),
  }
}

/** Sessions newest-first, for the picker. */
export function listSessions(store: ChatStore): SessionRecord[] {
  return [...store.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
}

/** An unused (message-less) session that can be reused instead of a fresh one. */
export function emptySessionId(store: ChatStore): string | null {
  const empty = store.sessions.find((s) => s.messages.length === 0)
  return empty ? empty.id : null
}

/** Drop unused (message-less) sessions except `keepId`, so empties don't pile up. */
export function pruneEmpty(store: ChatStore, keepId: string | null): ChatStore {
  const sessions = store.sessions.filter(
    (s) => s.messages.length > 0 || s.id === keepId
  )
  if (sessions.length === store.sessions.length) return store
  const currentId = sessions.some((s) => s.id === store.currentId)
    ? store.currentId
    : keepId
  return { currentId, sessions }
}

// --- localStorage I/O ---

/**
 * Namespace a project's chat store by the backing agent. ACP session ids are
 * agent-specific and incompatible across backends — an OpenCode session id is a
 * UUID-shaped string the OpenCode agent mints, while claude-agent-acp mints its
 * own. Resuming one backend's id against another fails (OpenCode rejects a
 * non-`ses…` id and can even corrupt its stdio stream), so each agent gets its
 * own session space. Without an agent name (older callers) the key is the bare
 * project id, preserving the pre-namespacing layout.
 */
export const scopeProject = (
  projectId: string,
  agentName?: string | null
): string => (agentName ? `${projectId}::${agentName}` : projectId)

const keyFor = (projectId: string) => `acorn:harnessChat:v1:${projectId}`
const legacyKeyFor = (projectId: string) => `acorn:harnessChat:${projectId}`

export function loadStore(projectId: string): ChatStore {
  try {
    const raw = localStorage.getItem(keyFor(projectId))
    if (raw) return JSON.parse(raw)
    // migrate the single-session format written before the picker existed
    const legacy = localStorage.getItem(legacyKeyFor(projectId))
    if (legacy) {
      const { sessionId, messages } = JSON.parse(legacy)
      if (sessionId)
        return upsertSession(emptyStore(), sessionId, messages || [], 0)
    }
  } catch (_) {}
  return emptyStore()
}

export function saveStore(projectId: string, store: ChatStore): void {
  try {
    localStorage.setItem(keyFor(projectId), JSON.stringify(store))
  } catch (_) {}
}

/** The agent scopes that have a stored chat for this project (null = the bare,
 *  pre-namespacing store). A snapshot, so callers may mutate storage while
 *  iterating it. */
function scopeAgentsFor(projectId: string): (string | null)[] {
  const base = keyFor(projectId)
  const out: (string | null)[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || key.indexOf(base) !== 0) continue
      const rest = key.slice(base.length)
      // '' → the bare project store; '::<agent>' → a scoped one. Anything else is
      // a *different* project whose id merely starts with this one — skip it.
      if (rest === '') out.push(null)
      else if (rest.indexOf('::') === 0) out.push(rest.slice(2))
    }
  } catch (_) {}
  return out
}

/**
 * Legacy-only id-shape rules, used **solely** to retro-classify chats stored
 * before records carried an explicit `agentName` stamp. Each rule maps a loose
 * match on the *connecting* agent's name to the id shape that agent mints, so
 * the one-time [[reclaimSessions]] can pull an unstamped chat back to the
 * backend that actually created it.
 *
 * IMPORTANT — future backends do NOT need an entry here. Every chat written from
 * now on is stamped with its owning agent ([[upsertSession]]), and stamped
 * records are authoritative — the reclaim never re-examines them. This table
 * exists only to clean up data that predates stamping. A new backend that never
 * had pre-stamp data simply never matches, and that's correct.
 */
const LEGACY_ID_SHAPES: { agent: RegExp; id: RegExp }[] = [
  // claude-agent-acp mints RFC-4122 UUID session ids
  {
    agent: /claude/i,
    id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  // OpenCode mints `ses…`-prefixed ids
  { agent: /opencode/i, id: /^ses/i },
]

/**
 * Self-correcting, idempotent reclaim run when a backend connects. It only ever
 * touches **unstamped** records (those predating [[upsertSession]] stamping) —
 * stamped records are authoritative and never moved by inference. For the
 * connecting `agentName`:
 *
 *  - if it has a [[LEGACY_ID_SHAPES]] rule, any unstamped chat whose id matches
 *    that shape is pulled from every other scope into this agent's scope and
 *    stamped — restoring it to its true author (and making it resumable again,
 *    since that agent minted the id);
 *  - unstamped chats it doesn't recognise are left untouched for the agent that
 *    does (each backend reclaims its own when it next connects).
 *
 * A backend with no rule (any future agent) is a no-op: its chats are stamped at
 * creation, so there is nothing to retro-classify. This is the *only* place an
 * author is ever inferred; everywhere else reads the recorded stamp.
 */
export function reclaimSessions(
  projectId: string,
  agentName?: string | null
): void {
  if (!agentName) return
  const rule = LEGACY_ID_SHAPES.find((r) => r.agent.test(agentName))
  if (!rule) return // arbitrary/new backend — nothing to retro-classify
  const mine = (s: SessionRecord) => !s.agentName && rule.id.test(s.id)
  try {
    const myArg = scopeProject(projectId, agentName)
    const myStore = loadStore(myArg)
    const claimed: SessionRecord[] = []

    for (const scopeAgent of scopeAgentsFor(projectId)) {
      if ((scopeAgent || null) === agentName) continue // own scope handled below
      const arg = scopeProject(projectId, scopeAgent)
      const store = loadStore(arg)
      const keep = store.sessions.filter((s) => !mine(s))
      if (keep.length === store.sessions.length) continue
      for (const s of store.sessions) if (mine(s)) claimed.push({ ...s, agentName })
      saveStore(arg, {
        currentId: keep.some((s) => s.id === store.currentId)
          ? store.currentId
          : null,
        sessions: keep,
      })
    }

    // Backfill stamps on my own unstamped, my-shaped chats (already in place).
    const backfilled = myStore.sessions.map((s) =>
      mine(s) ? { ...s, agentName } : s
    )
    const dirty =
      claimed.length ||
      backfilled.some((s, i) => s !== myStore.sessions[i])
    if (dirty) {
      const byId = new Map<string, SessionRecord>()
      for (const s of claimed) byId.set(s.id, s)
      for (const s of backfilled) byId.set(s.id, s) // own scope wins on collision
      saveStore(myArg, { currentId: myStore.currentId, sessions: [...byId.values()] })
    }
  } catch (_) {}
}

/**
 * Re-home a chat under a different backend: move its record from `fromAgent`'s
 * scope to `toAgent`'s and stamp it. If `toAgent` is the backend that minted the
 * session id, the chat is resumable again there; otherwise it stays readable and
 * forks onto a fresh id when continued. No-op if the source chat isn't found.
 */
export function moveSession(
  projectId: string,
  fromAgent: string | null,
  toAgent: string | null,
  id: string
): void {
  if ((fromAgent || null) === (toAgent || null)) return
  try {
    const fromArg = scopeProject(projectId, fromAgent)
    const from = loadStore(fromArg)
    const rec = from.sessions.find((s) => s.id === id)
    if (!rec) return
    saveStore(fromArg, removeSession(from, id))
    const toArg = scopeProject(projectId, toAgent)
    const to = loadStore(toArg)
    const stamped: SessionRecord = { ...rec, ...(toAgent ? { agentName: toAgent } : {}) }
    if (!toAgent) delete (stamped as { agentName?: string }).agentName
    const exists = to.sessions.some((s) => s.id === id)
    saveStore(toArg, {
      currentId: to.currentId,
      sessions: exists
        ? to.sessions.map((s) => (s.id === id ? stamped : s))
        : [...to.sessions, stamped],
    })
  } catch (_) {}
}

export function persistTurn(
  projectId: string,
  id: string,
  messages: ChatMessage[],
  now: number,
  agentName?: string | null,
  planSnapshots?: PlanSnapshot[] | null
): void {
  saveStore(
    projectId,
    upsertSession(loadStore(projectId), id, messages, now, agentName, planSnapshots)
  )
}

export function getSessionMessages(
  projectId: string,
  id: string
): ChatMessage[] {
  const found = loadStore(projectId).sessions.find((s) => s.id === id)
  return found ? found.messages : []
}

export function getSessionPlanSnapshots(
  projectId: string,
  id: string
): PlanSnapshot[] {
  const found = loadStore(projectId).sessions.find((s) => s.id === id)
  return found && found.planSnapshots ? found.planSnapshots : []
}

export function getCurrentId(projectId: string): string | null {
  return loadStore(projectId).currentId
}

/**
 * Move a chat's transcript onto a new session id and return it. Used when the
 * host couldn't resume the prior ACP session (e.g. it was restarted) and handed
 * us a fresh session: we keep the conversation under the new id instead of
 * losing it, and drop the old (now-duplicate) record. Returns [] if unknown.
 */
export function migrateSession(
  projectId: string,
  fromId: string,
  toId: string,
  now: number,
  agentName?: string | null
): ChatMessage[] {
  const store = loadStore(projectId)
  const found = store.sessions.find((s) => s.id === fromId)
  if (!found) return []
  // `toId` is a fresh session minted by the current agent → stamp it as such.
  // Carry the plan history forward too, so it isn't lost on a re-home.
  saveStore(
    projectId,
    upsertSession(
      removeSession(store, fromId),
      toId,
      found.messages,
      now,
      agentName,
      found.planSnapshots
    )
  )
  return found.messages
}

/** An existing empty session to reuse instead of creating another, or null. */
export function reusableEmptySessionId(projectId: string): string | null {
  return emptySessionId(loadStore(projectId))
}

/** Keep at most one empty chat — drop other unused sessions. */
export function pruneEmptySessions(projectId: string, keepId: string): void {
  saveStore(projectId, pruneEmpty(loadStore(projectId), keepId))
}

export function deleteSession(projectId: string, id: string): void {
  saveStore(projectId, removeSession(loadStore(projectId), id))
}

/** A project's chats for one backing agent. `agentName` is null for the bare,
 *  pre-namespacing store (see [[reclaimSessions]]). */
export interface SessionGroup {
  agentName: string | null
  sessions: SessionRecord[]
}

/**
 * Every stored chat for a project, grouped by the agent that owns it — across
 * all backends, not just the one currently attached. The picker uses this to
 * show other agents' chats in a read-only way (their ACP session ids can't be
 * resumed by a different backend, but the transcript is still worth reading),
 * grouped under the agent name. Scans the `acorn:harnessChat:v1:<project>` and
 * `…<project>::<agent>` keys; empty groups are omitted. Newest session first
 * within each group; group order is localStorage order (the caller sorts/labels).
 */
export function listScopedSessions(projectId: string): SessionGroup[] {
  const groups: SessionGroup[] = []
  for (const agentName of scopeAgentsFor(projectId)) {
    const sessions = listSessions(loadStore(scopeProject(projectId, agentName)))
    if (sessions.length) groups.push({ agentName, sessions })
  }
  return groups
}
