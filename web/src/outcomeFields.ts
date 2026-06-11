/**
 * OutcomeFields — the extensible, typed "fields" object a clarity-tree node carries.
 *
 * Interim representation (clarity-tree plan, modification #5): the fields object is
 * stored as JSON text inside the Outcome `description` field, so NO Holochain
 * integrity-zome / DHT change is required yet. A node's one-sentence NAME stays in
 * `content`; the detailed outcome statement and the other typed facets live here,
 * parsed out of `description`.
 *
 * This module is the single source of truth for that representation: every reader
 * and writer of a node's typed content should go through parseFields/serializeFields
 * rather than touching `description` directly.
 */

export type Evaluator = 'human' | 'executable' | 'llm'
export type SignalType = 'gradient' | 'binary blocker'

export interface CompletionCriterion {
  statement: string
  evaluator: Evaluator
  evidence?: string
}

export interface OutcomeArtifact {
  type: string
  label: string
  uri: string
}

/**
 * The known field types. The object is intentionally OPEN: unrecognised keys are
 * preserved verbatim through parse/serialize, so new field types can be added
 * (by humans or agents) without changing this code.
 */
export interface OutcomeFields {
  /** the detailed, fleshed-out target-state statement (distinct from `content`) */
  outcome: string
  signalType?: SignalType
  spec?: string
  completionCriteria?: CompletionCriterion[]
  principle?: string
  artifacts?: OutcomeArtifact[]
  /** forward-compatible: future field types are carried through untouched */
  [key: string]: unknown
}

/** Canonical key order = intended widget order in the editor. */
const KNOWN_KEY_ORDER = [
  'outcome',
  'signalType',
  'spec',
  'completionCriteria',
  'principle',
  'artifacts',
] as const

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Parse an Outcome `description` string into an OutcomeFields object.
 *
 * Legacy fallback: a pre-migration description is plain prose, not JSON. We treat
 * the description as a fields object ONLY when it parses to a JSON object that has
 * a string `outcome` key; otherwise the whole string becomes `fields.outcome`, so
 * existing trees keep rendering and nothing is lost. (A legacy description that
 * happens to be valid JSON without an `outcome` key — e.g. `{"foo":1}` — is
 * conservatively preserved as outcome text rather than misread as fields.)
 */
export function parseFields(description: string): OutcomeFields {
  if (!description) return { outcome: '' }
  try {
    const parsed: unknown = JSON.parse(description)
    if (isPlainObject(parsed) && typeof parsed.outcome === 'string') {
      return parsed as OutcomeFields
    }
  } catch {
    // not JSON — fall through to legacy handling
  }
  return { outcome: description }
}

/**
 * Serialize an OutcomeFields object back to the string stored in `description`.
 * Known keys are emitted in canonical order; any extra (future) keys follow,
 * preserving extensibility. Pretty-printed so the raw-JSON fallback widget and the
 * sample-import files stay human-readable, and so serialize is a stable fixpoint.
 */
export function serializeFields(fields: OutcomeFields): string {
  const ordered: Record<string, unknown> = {}
  for (const key of KNOWN_KEY_ORDER) {
    if (fields[key] !== undefined) ordered[key] = fields[key]
  }
  for (const key of Object.keys(fields)) {
    if (!(key in ordered) && fields[key] !== undefined) ordered[key] = fields[key]
  }
  return JSON.stringify(ordered, null, 2)
}

/**
 * Convenience for read-sites (search, list display) that want the human-readable
 * outcome statement rather than the raw stored string.
 */
export function getOutcomeStatement(description: string): string {
  return parseFields(description).outcome
}

/**
 * Replace ONLY the outcome statement within a stored description, preserving every
 * other field. This is what the editor's outcome widget writes on change, so editing
 * the statement never disturbs spec / completionCriteria / artifacts / etc.
 */
export function setOutcomeStatement(description: string, statement: string): string {
  return setField(description, 'outcome', statement)
}

/**
 * Set (or, with `undefined`, remove) a single field within a stored description,
 * preserving all other fields. The per-field editor writes through this so each
 * widget only ever touches its own field.
 */
export function setField(description: string, key: string, value: unknown): string {
  return serializeFields({ ...parseFields(description), [key]: value } as OutcomeFields)
}

/**
 * The present field keys in canonical (widget) order — known keys first in the order
 * the editor renders them, then any extra/future keys. Drives the per-field editor.
 */
export function orderedFieldKeys(fields: OutcomeFields): string[] {
  const order = KNOWN_KEY_ORDER as readonly string[]
  const known = order.filter((k) => fields[k] !== undefined)
  const extra = Object.keys(fields).filter((k) => !order.includes(k))
  return [...known, ...extra]
}
