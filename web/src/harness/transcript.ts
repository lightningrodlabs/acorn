/**
 * A portable, serializable record of an in-app chat session — the conversation
 * that shaped a branch — captured so it can be retained on a node as a
 * `conversation` artifact (see the branch-transcript leaves).
 *
 * This is deliberately SEPARATE from the localStorage chat store (chatHistory.ts):
 * that store is keyed by project + backing agent and tuned for resume/picker; a
 * Transcript is a self-contained, agent-neutral snapshot meant to travel WITH a
 * node, independent of where the live chat lives. buildTranscript projects a
 * stored session into this shape; serialize/parse round-trip it losslessly.
 *
 * Everything here is pure (no I/O, no React, no store) so the round-trip is
 * unit-testable on its own — the leaf's executable completion criterion.
 */
import {
  ChatMessage,
  ChatRole,
  ChatSelection,
  ChatToolCall,
  PlanSnapshot,
  SessionRecord,
} from './chatHistory'

/** Bump when the on-disk shape changes incompatibly. */
export const TRANSCRIPT_VERSION = 1

/** A tool call preserved on a turn (mirrors ChatToolCall; re-exported as the
 *  transcript-facing name so consumers don't reach into the chat store). */
export type TranscriptToolCall = ChatToolCall

/** The ask-time selection preserved on a (user) turn. */
export type TranscriptSelection = ChatSelection

/** One turn of the conversation. `content` is the message text; optional fields
 *  are omitted (not null) when absent, so a round-trip is byte-for-byte stable. */
export interface TranscriptTurn {
  role: ChatRole
  content: string
  timestamp?: number
  thinking?: string
  toolCalls?: TranscriptToolCall[]
  /** Node(s) selected when this (user) turn was sent — the ask-time anchor. */
  selection?: TranscriptSelection[]
}

export interface Transcript {
  version: number
  sessionId: string
  agentName?: string
  title: string
  /** When the transcript was captured (ms epoch) — distinct from per-turn times. */
  capturedAt: number
  turns: TranscriptTurn[]
  /** The agent's plan over the session, one snapshot per ACP `plan` update.
   *  Session-level (a plan update isn't tied to a turn); omitted when none. */
  planSnapshots?: PlanSnapshot[]
}

/** A reference to a propose_edits tool call within the conversation — the
 *  "proposed-edit references" the capture must preserve. Derived, not stored. */
export interface ProposedEditRef {
  turnIndex: number
  id: string
  title: string
  status: TranscriptToolCall['status']
}

const VALID_ROLES: ChatRole[] = ['user', 'agent', 'system']
const VALID_STATUSES: TranscriptToolCall['status'][] = [
  'pending',
  'in_progress',
  'completed',
  'failed',
]

/** True if a tool-call title names the Acorn propose_edits tool (the seam by
 *  which the agent proposes tree edits). Matched loosely on the title, mirroring
 *  isAcornToolTitle, but kept local so this module stays dependency-free. */
export function isProposeEditsTitle(title: string | undefined): boolean {
  return (title || '').toLowerCase().includes('propose_edits')
}

function normalizeToolCall(raw: any): TranscriptToolCall | null {
  if (!raw || typeof raw !== 'object') return null
  const id = typeof raw.id === 'string' ? raw.id : null
  const title = typeof raw.title === 'string' ? raw.title : null
  if (id === null || title === null) return null
  const status = VALID_STATUSES.includes(raw.status) ? raw.status : 'completed'
  const tc: TranscriptToolCall = { id, title, status }
  if (typeof raw.kind === 'string') tc.kind = raw.kind
  return tc
}

function normalizeSelection(raw: any): TranscriptSelection | null {
  if (!raw || typeof raw !== 'object') return null
  const actionHash = typeof raw.actionHash === 'string' ? raw.actionHash : null
  const id = typeof raw.id === 'string' ? raw.id : null
  if (actionHash === null || id === null) return null
  const sel: TranscriptSelection = { actionHash, id }
  if (typeof raw.content === 'string') sel.content = raw.content
  return sel
}

function normalizePlanSnapshot(raw: any): PlanSnapshot | null {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.entries)) return null
  const entries = raw.entries
    .filter((e: any) => e && typeof e === 'object' && typeof e.content === 'string')
    .map((e: any) => ({
      content: e.content,
      priority: typeof e.priority === 'string' ? e.priority : 'medium',
      status: typeof e.status === 'string' ? e.status : 'pending',
    }))
  return { at: typeof raw.at === 'number' ? raw.at : 0, entries }
}

/** Project a stored chat message into a transcript turn, dropping absent
 *  optionals so it round-trips cleanly. Unknown roles fall back to `system`. */
export function messageToTurn(m: ChatMessage): TranscriptTurn {
  const turn: TranscriptTurn = {
    role: VALID_ROLES.includes(m.role) ? m.role : 'system',
    content: typeof m.text === 'string' ? m.text : '',
  }
  if (typeof m.at === 'number') turn.timestamp = m.at
  if (typeof m.thinking === 'string' && m.thinking !== '') turn.thinking = m.thinking
  const calls = (m.toolCalls || [])
    .map(normalizeToolCall)
    .filter((c): c is TranscriptToolCall => c !== null)
  if (calls.length) turn.toolCalls = calls
  const sel = (m.selection || [])
    .map(normalizeSelection)
    .filter((s): s is TranscriptSelection => s !== null)
  if (sel.length) turn.selection = sel
  return turn
}

/** Build a transcript from a stored chat session, preserving turn order. */
export function buildTranscript(
  session: SessionRecord,
  capturedAt: number
): Transcript {
  const t: Transcript = {
    version: TRANSCRIPT_VERSION,
    sessionId: session.id,
    title: session.title || '',
    capturedAt,
    turns: (session.messages || []).map(messageToTurn),
  }
  if (session.agentName) t.agentName = session.agentName
  const plans = (session.planSnapshots || [])
    .map(normalizePlanSnapshot)
    .filter((p): p is PlanSnapshot => p !== null)
  if (plans.length) t.planSnapshots = plans
  return t
}

/**
 * The conversation's anchor: the ask-time selection of the FIRST user turn —
 * what framed the conversation. Empty when no user turn carried a selection.
 * The attach flow uses this as the no-edits-session fallback target.
 */
export function anchorSelection(t: Transcript): TranscriptSelection[] {
  const firstUser = t.turns.find((x) => x.role === 'user' && (x.selection || []).length)
  return firstUser ? firstUser.selection || [] : []
}

/** Serialize a transcript to a JSON string for storage in an artifact. */
export function serializeTranscript(t: Transcript): string {
  return JSON.stringify(t)
}

/**
 * Parse a transcript JSON string back into a Transcript, normalizing each turn
 * so the result is well-formed regardless of input drift. Throws on input that
 * isn't a transcript object at all (so callers can surface a clear error rather
 * than silently render an empty thread).
 */
export function parseTranscript(raw: string): Transcript {
  const obj = JSON.parse(raw)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.turns)) {
    throw new Error('Not a transcript: missing turns[]')
  }
  const turns: TranscriptTurn[] = obj.turns.map((rawTurn: any) =>
    messageToTurn({
      id: 0,
      role: rawTurn?.role,
      text: rawTurn?.content,
      at: rawTurn?.timestamp,
      thinking: rawTurn?.thinking,
      toolCalls: Array.isArray(rawTurn?.toolCalls) ? rawTurn.toolCalls : undefined,
      selection: Array.isArray(rawTurn?.selection) ? rawTurn.selection : undefined,
    })
  )
  const t: Transcript = {
    version: typeof obj.version === 'number' ? obj.version : TRANSCRIPT_VERSION,
    sessionId: typeof obj.sessionId === 'string' ? obj.sessionId : '',
    title: typeof obj.title === 'string' ? obj.title : '',
    capturedAt: typeof obj.capturedAt === 'number' ? obj.capturedAt : 0,
    turns,
  }
  if (typeof obj.agentName === 'string') t.agentName = obj.agentName
  const plans = (Array.isArray(obj.planSnapshots) ? obj.planSnapshots : [])
    .map(normalizePlanSnapshot)
    .filter((p: PlanSnapshot | null): p is PlanSnapshot => p !== null)
  if (plans.length) t.planSnapshots = plans
  return t
}

/**
 * The propose_edits tool calls across the whole conversation, with the turn each
 * belongs to — the proposed-edit references retained by the capture. Empty when
 * the session never proposed edits.
 */
export function proposedEdits(t: Transcript): ProposedEditRef[] {
  const out: ProposedEditRef[] = []
  t.turns.forEach((turn, turnIndex) => {
    for (const c of turn.toolCalls || []) {
      if (isProposeEditsTitle(c.title)) {
        out.push({ turnIndex, id: c.id, title: c.title, status: c.status })
      }
    }
  })
  return out
}
