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

export interface ChatMessage {
  id: number
  role: ChatRole
  text: string
}

export interface SessionRecord {
  id: string
  title: string
  updatedAt: number
  messages: ChatMessage[]
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

/** Insert or replace a session's record and mark it current. */
export function upsertSession(
  store: ChatStore,
  id: string,
  messages: ChatMessage[],
  now: number
): ChatStore {
  const record: SessionRecord = {
    id,
    title: deriveTitle(messages),
    updatedAt: now,
    messages,
  }
  const exists = store.sessions.some((s) => s.id === id)
  const sessions = exists
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

// --- localStorage I/O ---

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

export function persistTurn(
  projectId: string,
  id: string,
  messages: ChatMessage[],
  now: number
): void {
  saveStore(projectId, upsertSession(loadStore(projectId), id, messages, now))
}

export function getSessionMessages(
  projectId: string,
  id: string
): ChatMessage[] {
  const found = loadStore(projectId).sessions.find((s) => s.id === id)
  return found ? found.messages : []
}

export function getCurrentId(projectId: string): string | null {
  return loadStore(projectId).currentId
}

export function deleteSession(projectId: string, id: string): void {
  saveStore(projectId, removeSession(loadStore(projectId), id))
}
