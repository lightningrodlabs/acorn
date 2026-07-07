import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Icon from '../Icon/Icon'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import { CompletionCriterion, Evaluator } from '../../outcomeFields'

// The completion-criteria checklist (loop-eval-signal): one row per criterion —
// the confirm checkbox + evaluator on the LEFT, an auto-growing/resizable statement
// textarea with the evidence line under it on the RIGHT — replacing the raw-JSON
// fallback for completionCriteria.
//
// Saving follows the editor's DEFERRED model, not a per-change zome call: every
// change (checkbox, evaluator, statement, add/remove) is batched into the node's
// `description` via onChange, and the actual commit happens on the shared onBlur
// (updateOutcomeWithLatest) when focus leaves the control. So many edits collapse
// into one commit and Esc still cancels. The bug this fixes: the checkbox/select
// never wired onBlur, so their batched change sat uncommitted — every control now
// routes its blur through the shared onBlur, exactly like the text fields.
//
// EVERY criterion's checkbox is interactive, whatever its evaluator. Conceptually an
// executable/llm verdict is the recorded result of its check — but until there is a
// live runner to set those verdicts, the human records them all by hand, so locking
// executable/llm checkboxes would orphan them. (When a runner lands, make executable
// verdicts runner-owned then.)

const EVALUATORS: Evaluator[] = ['human', 'executable', 'llm']

export type CompletionCriteriaFieldProps = {
  label: string
  iconName: string
  value: CompletionCriterion[]
  disabled: boolean
  // who is confirming (agent pub key), recorded as the verdict's `by`
  currentUserId?: string
  // batch a change into the node description (commit is deferred to onBlur)
  onChange: (value: CompletionCriterion[]) => void
  // the shared deferred-commit blur (updateOutcomeWithLatest)
  onBlur: React.FocusEventHandler<HTMLElement>
  onFocus: React.FocusEventHandler<HTMLElement>
}

const CompletionCriteriaField: React.FC<CompletionCriteriaFieldProps> = ({
  label,
  iconName,
  value,
  disabled,
  currentUserId,
  onChange,
  onBlur,
  onFocus,
}) => {
  const serialized = JSON.stringify(value ?? [])
  const [items, setItems] = useState<CompletionCriterion[]>(value ?? [])
  useEffect(() => {
    setItems(value ?? [])
  }, [serialized])

  // batch a new criteria array into the description; the commit waits for onBlur
  const batch = (next: CompletionCriterion[]) => {
    setItems(next)
    onChange(next)
  }
  const editText = (index: number, statement: string) => {
    batch(items.map((c, i) => (i === index ? { ...c, statement } : c)))
  }
  const setEvaluator = (index: number, evaluator: Evaluator) => {
    batch(items.map((c, i) => (i === index ? { ...c, evaluator } : c)))
  }
  // evidence backs the verdict; clearing the text removes the key entirely so an
  // evidence-less criterion serializes without an empty-string field
  const editEvidence = (index: number, evidence: string) => {
    batch(
      items.map((c, i) => {
        if (i !== index) return c
        if (!evidence) {
          const { evidence: _e, ...rest } = c
          return rest
        }
        return { ...c, evidence }
      })
    )
  }
  const toggleMet = (index: number) => {
    batch(
      items.map((c, i) => {
        if (i !== index) return c
        if (c.met === true) {
          // un-confirm: drop the stamp so no stale by/at lingers
          const { by, at, ...rest } = c
          return { ...rest, met: false }
        }
        return { ...c, met: true, by: currentUserId, at: Date.now() }
      })
    )
  }
  const addCriterion = () => {
    batch([...items, { statement: '', evaluator: 'human' as Evaluator }])
  }
  const removeCriterion = (index: number) => {
    batch(items.filter((_, i) => i !== index))
  }

  return (
    <MetadataWithLabel label={label} iconName={iconName}>
      <div className="completion-criteria-field">
        {items.map((c, index) => {
          return (
            <div
              className={`criterion-row${c.met ? ' criterion-met' : ''}`}
              key={index}
            >
              <div className="criterion-controls">
                <input
                  type="checkbox"
                  className="criterion-checkbox"
                  checked={c.met === true}
                  disabled={disabled}
                  title={
                    c.met
                      ? 'Met — click to un-confirm'
                      : 'Confirm this criterion is met'
                  }
                  onChange={() => toggleMet(index)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                />
                <select
                  className={`criterion-evaluator evaluator-${c.evaluator}`}
                  disabled={disabled}
                  value={c.evaluator}
                  onChange={(e) =>
                    setEvaluator(index, e.target.value as Evaluator)
                  }
                  onBlur={onBlur}
                  onFocus={onFocus}
                >
                  {EVALUATORS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>
              <div className="criterion-texts">
                <TextareaAutosize
                  className="criterion-statement"
                  minRows={2}
                  disabled={disabled}
                  placeholder="criterion (how this is judged done)"
                  value={c.statement}
                  onChange={(e) => editText(index, e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                />
                <TextareaAutosize
                  className="criterion-evidence"
                  minRows={1}
                  disabled={disabled}
                  placeholder="evidence (what backs the verdict — link, log, note)"
                  value={c.evidence || ''}
                  onChange={(e) => editEvidence(index, e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                />
              </div>
              {!disabled && (
                <Icon
                  name="delete-bin.svg"
                  size="small"
                  className="light-grey criterion-remove"
                  onClick={() => removeCriterion(index)}
                />
              )}
            </div>
          )
        })}
        {!disabled && (
          <button
            type="button"
            className="criterion-add"
            onClick={addCriterion}
          >
            <Icon name="plus.svg" size="small" className="not-hoverable" />
            <span>Add criterion</span>
          </button>
        )}
      </div>
    </MetadataWithLabel>
  )
}

export default CompletionCriteriaField
