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
  /** the recorded verdict — set true when this criterion has been met */
  met?: boolean
  /** who recorded the verdict (agent pub key), when known */
  by?: string
  /** when the verdict was recorded (unix ms), when known */
  at?: number
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
  /**
   * Optional human-assigned handle — a memorable slug ([a-z0-9-]) that names this
   * node stably across rearrangement. Author-assigned (not positional), unique
   * within a project. Unset/empty is valid; a node with no handle simply has none.
   * It is authored metadata, not a content section, so it renders in the node's
   * header (next to the id) rather than as its own field widget.
   */
  handle?: string
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
  'handle',
  'signalType',
  'spec',
  'completionCriteria',
  'principle',
  'artifacts',
] as const

/** The authored field key holding a node's optional human-assigned handle. */
export const HANDLE_KEY = 'handle'

/**
 * Reserved field key: a map of fieldKey -> chosen render-widget, recorded only for
 * custom (free-form) sections whose widget can't be inferred from a known key. It is
 * hidden from the editor's rendered sections but preserved through serialize like any
 * other field, so a custom section re-renders with the widget the author chose.
 */
export const WIDGET_REGISTRY_KEY = '_widgets'

/**
 * Keys that round-trip through the fields but are NOT rendered as their own content
 * section: the widget registry (internal) and the handle (shown in the node header,
 * edited there). They are excluded from `orderedFieldKeys` so the editor never draws
 * a raw-JSON section for them, while serialize still preserves them.
 */
const NON_SECTION_KEYS = new Set<string>([WIDGET_REGISTRY_KEY, HANDLE_KEY])

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
 * the editor renders them, then any extra/future keys. The reserved widget-registry
 * key is never a rendered section, so it is excluded. Drives the per-field editor.
 */
export function orderedFieldKeys(fields: OutcomeFields): string[] {
  const order = KNOWN_KEY_ORDER as readonly string[]
  const known = order.filter(
    (k) => fields[k] !== undefined && !NON_SECTION_KEYS.has(k)
  )
  const extra = Object.keys(fields).filter(
    (k) => !order.includes(k) && !NON_SECTION_KEYS.has(k)
  )
  return [...known, ...extra]
}

/** The recorded render-widget choices for custom sections (see WIDGET_REGISTRY_KEY). */
export function fieldWidgetRegistry(fields: OutcomeFields): Record<string, string> {
  const reg = fields[WIDGET_REGISTRY_KEY]
  return isPlainObject(reg) ? (reg as Record<string, string>) : {}
}

/**
 * Add a section: set `key` to `initialValue` (unless it is already present, in which
 * case it is left untouched), optionally recording a chosen render-`widget` so a
 * custom/free-form section re-renders correctly. Returns the new stored description.
 */
export function addField(
  description: string,
  key: string,
  initialValue: unknown,
  widget?: string
): string {
  const fields = parseFields(description)
  const next: OutcomeFields = { ...fields, [key]: fields[key] ?? initialValue }
  if (widget) {
    next[WIDGET_REGISTRY_KEY] = { ...fieldWidgetRegistry(fields), [key]: widget }
  }
  return serializeFields(next)
}

// --- completion-criterion verdicts -------------------------------------------

/** Whether a single criterion has been met (its verdict recorded true). */
export function criterionMet(c: CompletionCriterion): boolean {
  return c.met === true
}

/** The completion criteria on a node's description, or []. */
export function getCompletionCriteria(description: string): CompletionCriterion[] {
  const cc = parseFields(description).completionCriteria
  return Array.isArray(cc) ? cc : []
}

/**
 * Record (or clear) a criterion's verdict at `index`, preserving every other
 * field. Returns the new stored description. `met:true` stamps {by, at}; clearing
 * to false removes by/at so an un-confirm leaves no stale stamp.
 */
export function setCriterionVerdict(
  description: string,
  index: number,
  met: boolean,
  by?: string,
  at?: number
): string {
  const criteria = getCompletionCriteria(description)
  if (index < 0 || index >= criteria.length) return description
  const next = criteria.map((c, i) => {
    if (i !== index) return c
    if (met) return { ...c, met: true, by, at }
    const { by: _b, at: _a, ...rest } = c
    return { ...rest, met: false }
  })
  return setField(description, 'completionCriteria', next)
}

/**
 * Awaiting human evaluation: at least one human-evaluator completion criterion
 * that has not yet been met. The leaf-level "build work done" gate (all tasks
 * checked) is applied by the caller, since it lives on scope, not in the fields.
 * Pure — drives both the editor checklist and the leaf colour.
 */
export function hasUnconfirmedHumanCriterion(fields: OutcomeFields): boolean {
  const cc = fields.completionCriteria
  if (!Array.isArray(cc)) return false
  return cc.some((c) => c.evaluator === 'human' && c.met !== true)
}

/**
 * Every completion criterion is met (and there is at least one). With the build
 * work done, this is the "ready for final sign-off" point — all the evidence is in
 * but the leaf has not yet been marked Achieved. Pure — drives the leaf colour.
 */
export function allCriteriaMet(fields: OutcomeFields): boolean {
  const cc = fields.completionCriteria
  if (!Array.isArray(cc) || cc.length === 0) return false
  return cc.every((c) => c.met === true)
}

// --- handle (stable human-usable reference) ----------------------------------

export interface HandleValidation {
  valid: boolean
  /** human-readable reason when invalid */
  message?: string
}

/** A handle is a lowercase slug: letters, digits, hyphens. */
const HANDLE_PATTERN = /^[a-z0-9-]+$/

/**
 * Validate a handle slug. Empty/undefined is valid (it means "no handle"). A
 * non-empty handle must be a [a-z0-9-] slug. Pure — uniqueness is a separate,
 * project-scoped check (see nodeRef.handleConflict).
 */
export function validateHandle(handle: string | undefined | null): HandleValidation {
  if (handle === undefined || handle === null || handle === '') return { valid: true }
  if (!HANDLE_PATTERN.test(handle)) {
    return {
      valid: false,
      message:
        'A handle may contain only lowercase letters, digits, and hyphens (e.g. "read-tree").',
    }
  }
  return { valid: true }
}

/** The handle stored on a node's description, or undefined when none/blank. */
export function getHandle(description: string): string | undefined {
  const h = parseFields(description).handle
  return typeof h === 'string' && h.length > 0 ? h : undefined
}

/**
 * Set (or clear, with an empty/undefined value) a node's handle, preserving every
 * other field. Clearing removes the key entirely so the node falls back to its id.
 */
export function setHandle(description: string, handle: string | undefined): string {
  return setField(description, HANDLE_KEY, handle ? handle : undefined)
}

/** Remove a section and any widget-registry entry it carried. */
export function removeField(description: string, key: string): string {
  const fields = parseFields(description)
  const next: OutcomeFields = { ...fields }
  delete next[key]
  const reg = { ...fieldWidgetRegistry(fields) }
  if (key in reg) {
    delete reg[key]
    if (Object.keys(reg).length) next[WIDGET_REGISTRY_KEY] = reg
    else delete next[WIDGET_REGISTRY_KEY]
  }
  return serializeFields(next)
}
