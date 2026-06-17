/**
 * outcomeDiff — turn a (committed outcome, proposed outcome) pair into a flat list
 * of field-level changes for a PR-style review (clarity-tree draft pipeline L3).
 * Pure; no Redux. The panel renders each row as before → after with red/green.
 *
 * Fields covered: the node name (content), every clarity field parsed out of the
 * description (outcome statement, spec, principle, completionCriteria, …), the
 * achievement status, and the checklist tasks. Unparseable/structured values are
 * shown as compact JSON so nothing is silently dropped.
 */
import { parseFields } from '../../outcomeFields'

export type FieldChangeKind = 'added' | 'removed' | 'changed'

export interface FieldChange {
  /** human label, e.g. "Name", "Outcome", "Spec", "Task: …" */
  label: string
  kind: FieldChangeKind
  before: string
  after: string
}

const toText = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

const FIELD_LABELS: Record<string, string> = {
  outcome: 'Outcome',
  spec: 'Spec',
  principle: 'Principle',
  completionCriteria: 'Completion criteria',
  signalType: 'Signal type',
  artifacts: 'Artifacts',
}
const labelForField = (key: string): string =>
  FIELD_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)

const achievementStatus = (o: any): string => {
  const small = o?.scope?.Small
  if (small) return `Small${small.achievementStatus ? ` · ${small.achievementStatus}` : ''}`
  if (o?.scope && 'Uncertain' in o.scope) return 'Uncertain'
  return ''
}

function pushIfChanged(
  out: FieldChange[],
  label: string,
  before: unknown,
  after: unknown
) {
  const b = toText(before)
  const a = toText(after)
  if (b === a) return
  out.push({
    label,
    before: b,
    after: a,
    kind: !b ? 'added' : !a ? 'removed' : 'changed',
  })
}

/**
 * Field-level changes from `prev` (committed; null when the node is being added)
 * to `next` (proposed; null when the node is being removed).
 */
export function outcomeFieldChanges(prev: any | null, next: any | null): FieldChange[] {
  const out: FieldChange[] = []
  // name
  pushIfChanged(out, 'Name', prev?.content, next?.content)
  // achievement status / scope
  pushIfChanged(out, 'Status', prev ? achievementStatus(prev) : '', next ? achievementStatus(next) : '')
  // clarity fields parsed from description
  const prevFields = prev ? parseFields(prev.description || '') : {}
  const nextFields = next ? parseFields(next.description || '') : {}
  const keys = [
    ...new Set([...Object.keys(prevFields), ...Object.keys(nextFields)]),
  ].filter((k) => k !== '_widgets')
  for (const key of keys) {
    pushIfChanged(out, labelForField(key), (prevFields as any)[key], (nextFields as any)[key])
  }
  // checklist tasks, matched by text
  const prevTasks: any[] = prev?.scope?.Small?.taskList ?? []
  const nextTasks: any[] = next?.scope?.Small?.taskList ?? []
  const prevByText = new Map(prevTasks.map((t) => [t.task, t]))
  const nextByText = new Map(nextTasks.map((t) => [t.task, t]))
  for (const [text, task] of nextByText) {
    const before = prevByText.get(text)
    const fmt = (t: any) => (t ? `${t.complete ? '☑' : '☐'} ${t.task}` : '')
    if (!before) out.push({ label: 'Task', kind: 'added', before: '', after: fmt(task) })
    else if (before.complete !== (task as any).complete)
      out.push({ label: 'Task', kind: 'changed', before: fmt(before), after: fmt(task) })
  }
  for (const [text, task] of prevByText) {
    if (!nextByText.has(text))
      out.push({ label: 'Task', kind: 'removed', before: `☐ ${(task as any).task}`, after: '' })
  }
  return out
}
