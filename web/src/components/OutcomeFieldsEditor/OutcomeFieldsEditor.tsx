import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Profile } from '../../types'
import { WithActionHash } from '../../types/shared'
import {
  parseFields,
  setField,
  addField,
  removeField,
  orderedFieldKeys,
  fieldWidgetRegistry,
  getHandle,
  setHandle,
  validateHandle,
  OutcomeArtifact,
  CompletionCriterion,
} from '../../outcomeFields'
import Icon from '../Icon/Icon'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import ArtifactsField from './ArtifactsField'
import CompletionCriteriaField from './CompletionCriteriaField'
import { askConfirm } from '../AskDialog/AskDialog'
import './OutcomeFieldsEditor.scss'

// --- field-type registry -----------------------------------------------------
// Each OutcomeFields key maps to a widget kind. Text fields use the markdown
// widget; artifacts use the dedicated list editor (branch E); anything else
// falls back to a raw-JSON editor, so new/structured field types are never lost.
// A custom (free-form) section records its chosen widget in the fields' widget
// registry, so its key resolves to that widget rather than the raw-JSON default.
type WidgetKind = 'markdown' | 'artifacts' | 'criteria' | 'rawjson'
const FIELD_WIDGET: Record<string, WidgetKind> = {
  outcome: 'markdown',
  spec: 'markdown',
  principle: 'markdown',
  artifacts: 'artifacts',
  completionCriteria: 'criteria',
}

// The widget choices offered for a custom section, and the empty value each starts
// from (the value's shape is what its widget reads/writes).
const WIDGET_CHOICES: { kind: WidgetKind; label: string }[] = [
  { kind: 'markdown', label: 'Markdown text' },
  { kind: 'artifacts', label: 'Artifacts list' },
  { kind: 'criteria', label: 'Completion criteria' },
  { kind: 'rawjson', label: 'Raw JSON' },
]
const EMPTY_VALUE_FOR: Record<WidgetKind, unknown> = {
  markdown: '',
  artifacts: [],
  criteria: [],
  rawjson: {},
}

// The known sections a node can grow into beyond its always-present Outcome, in the
// order they are offered. Each starts from the empty value its widget expects.
// (signalType is intentionally omitted — it is a specialized branch-G classifier, not
// a general content section; the field type stays supported and renders if present.)
const ADDABLE_KNOWN: { key: string; initial: unknown }[] = [
  { key: 'spec', initial: '' },
  { key: 'completionCriteria', initial: [] },
  { key: 'principle', initial: '' },
  { key: 'artifacts', initial: [] },
]

// Whether a section holds enough to be worth confirming before discarding it.
const hasContent = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return value !== undefined && value !== null
}

const FIELD_LABELS: Record<string, string> = {
  outcome: 'Outcome',
  spec: 'Spec',
  principle: 'Principle',
  completionCriteria: 'Completion criteria',
  signalType: 'Signal type',
  artifacts: 'Artifacts',
}
const labelFor = (key: string): string => FIELD_LABELS[key] ?? key

// A distinct icon per widget type, with a couple of per-field niceties.
const WIDGET_ICON: Record<WidgetKind, string> = {
  markdown: 'text-align-left.svg',
  artifacts: 'attachment.svg',
  criteria: 'square-check.svg',
  rawjson: 'file-copy.svg',
}
const FIELD_ICON: Record<string, string> = {
  completionCriteria: 'square-check.svg',
  signalType: 'tag.svg',
}
const iconFor = (key: string, kind: WidgetKind): string =>
  FIELD_ICON[key] ?? WIDGET_ICON[kind]

export type OutcomeFieldsEditorProps = {
  // the full serialized fields string (the Outcome `description`)
  description: string
  // called with the new serialized description whenever a field changes
  onChange: (description: string) => void
  // shared (coarse) co-editing presence — per-field presence is a later concern
  isBeingEditedByOther: boolean
  personEditing: WithActionHash<Profile>
  onFieldBlur: React.FocusEventHandler<HTMLElement>
  onFieldFocus: React.FocusEventHandler<HTMLElement>
  // handle uniqueness: map of handle -> actionHash for OTHER nodes in the project,
  // and this node's own actionHash (excluded from the conflict check). Optional —
  // when omitted, only slug-format validation is enforced.
  takenHandles?: Record<string, string>
  selfActionHash?: string
  // current agent pub key — recorded as the `by` on a confirmed criterion
  currentUserId?: string
}

// Renders one widget per present field, looked up through the registry. The
// outcome statement is just the first text field; spec/principle are markdown too;
// everything else uses the raw-JSON fallback.
const OutcomeFieldsEditor: React.FC<OutcomeFieldsEditorProps> = ({
  description,
  onChange,
  isBeingEditedByOther,
  personEditing,
  onFieldBlur,
  onFieldFocus,
  takenHandles,
  selfActionHash,
  currentUserId,
}) => {
  const fields = parseFields(description)
  const keys = orderedFieldKeys(fields)
  const widgets = fieldWidgetRegistry(fields)
  // known key -> its widget; custom key -> its recorded widget; else raw JSON
  const widgetFor = (key: string): WidgetKind =>
    FIELD_WIDGET[key] ?? (widgets[key] as WidgetKind) ?? 'rawjson'

  // add-section affordance state (132188): pick a known section, or name a
  // free-form one and choose its render-widget
  const [adding, setAdding] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [customWidget, setCustomWidget] = useState<WidgetKind>('markdown')

  // --- handle (stable human-usable reference) --------------------------------
  // Local input mirrors the stored handle; it is committed to the fields only when
  // it passes slug validation AND is unique within the project, so an invalid or
  // colliding handle never persists. Clearing it removes the handle (revert to id).
  const storedHandle = getHandle(description) ?? ''
  const [handleInput, setHandleInput] = useState(storedHandle)
  useEffect(() => {
    setHandleInput(getHandle(description) ?? '')
  }, [description])
  const handleTrimmed = handleInput.trim()
  const formatCheck = validateHandle(handleTrimmed)
  const conflictHash =
    handleTrimmed && takenHandles ? takenHandles[handleTrimmed] : undefined
  const handleCollision = !!conflictHash && conflictHash !== selfActionHash
  const handleError = !formatCheck.valid
    ? formatCheck.message
    : handleCollision
    ? 'Another node in this project already uses that handle.'
    : undefined
  // Commit the handle into `description` LIVE as the user types (only when the
  // value is a valid, non-colliding slug). Committing on change — not on blur —
  // matches the markdown widgets and is what makes a single blur (clicking
  // outside the node) save: by the time the blur fires updateOutcomeWithLatest,
  // `description` state already carries the handle. Computed fresh from the raw
  // value because React state (handleInput) hasn't flushed yet inside onChange.
  const onHandleChange = (raw: string) => {
    setHandleInput(raw)
    const next = raw.trim()
    const conflict = next && takenHandles ? takenHandles[next] : undefined
    const invalid =
      !validateHandle(next).valid || (!!conflict && conflict !== selfActionHash)
    if (!invalid && next !== storedHandle) {
      onChange(setHandle(description, next || undefined))
    }
  }
  // On blur, if the field was left holding an invalid/colliding value, revert the
  // input to the last committed handle so the box never shows an unsaved value.
  const onHandleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (handleError) setHandleInput(storedHandle)
    onFieldBlur(e)
  }

  const present = (key: string) => fields[key] !== undefined
  const addableKnown = ADDABLE_KNOWN.filter((s) => !present(s.key))
  const customKeyTrimmed = customKey.trim()
  const canAddCustom =
    customKeyTrimmed.length > 0 &&
    !present(customKeyTrimmed) &&
    !(customKeyTrimmed in FIELD_LABELS)

  const closeAdd = () => {
    setAdding(false)
    setCustomKey('')
    setCustomWidget('markdown')
  }
  const addKnown = (key: string, initial: unknown) => {
    onChange(addField(description, key, initial))
    closeAdd()
  }
  const addCustom = () => {
    if (!canAddCustom) return
    onChange(
      addField(
        description,
        customKeyTrimmed,
        EMPTY_VALUE_FOR[customWidget],
        customWidget
      )
    )
    closeAdd()
  }
  const removeSection = async (key: string) => {
    // guard against discarding real content; an empty section removes silently
    if (hasContent(fields[key])) {
      const confirmed = await askConfirm({
        heading: 'Remove section?',
        message: `Remove the "${labelFor(key)}" section and discard its contents?`,
        confirmLabel: 'Remove',
      })
      if (!confirmed) return
    }
    onChange(removeField(description, key))
  }

  const renderWidget = (key: string) => {
    const kind = widgetFor(key)
    if (kind === 'markdown') {
      return (
        <MarkdownDescription
          label={labelFor(key)}
          iconName={iconFor(key, kind)}
          placeholder={`Add ${labelFor(key).toLowerCase()} (markdown supported)`}
          isBeingEditedByOther={isBeingEditedByOther}
          personEditing={personEditing}
          onBlur={onFieldBlur}
          onFocus={onFieldFocus}
          onChange={(value) => onChange(setField(description, key, value))}
          value={typeof fields[key] === 'string' ? (fields[key] as string) : ''}
        />
      )
    }
    if (kind === 'artifacts') {
      return (
        <ArtifactsField
          label={labelFor(key)}
          iconName={iconFor(key, kind)}
          disabled={isBeingEditedByOther}
          value={Array.isArray(fields[key]) ? (fields[key] as OutcomeArtifact[]) : []}
          onBlur={onFieldBlur}
          onFocus={onFieldFocus}
          onChange={(value) => onChange(setField(description, key, value))}
        />
      )
    }
    if (kind === 'criteria') {
      return (
        <CompletionCriteriaField
          label={labelFor(key)}
          iconName={iconFor(key, kind)}
          disabled={isBeingEditedByOther}
          currentUserId={currentUserId}
          value={
            Array.isArray(fields[key]) ? (fields[key] as CompletionCriterion[]) : []
          }
          onBlur={onFieldBlur}
          onFocus={onFieldFocus}
          onChange={(value) => onChange(setField(description, key, value))}
        />
      )
    }
    return (
      <RawJsonField
        label={labelFor(key)}
        iconName={iconFor(key, kind)}
        disabled={isBeingEditedByOther}
        value={fields[key]}
        onBlur={onFieldBlur}
        onFocus={onFieldFocus}
        onChange={(value) => onChange(setField(description, key, value))}
      />
    )
  }

  return (
    <div className="outcome-fields-editor">
      {/* Handle — an optional, project-unique slug that names this node stably
          across rearrangement. Shown in the node's header in place of its id. */}
      {!isBeingEditedByOther && (
        <div className="outcome-field-handle">
          <label className="outcome-field-handle-label" htmlFor="outcome-handle-input">
            <Icon name="link.svg" size="small" className="not-hoverable" />
            Handle
          </label>
          <input
            id="outcome-handle-input"
            className="outcome-field-handle-input"
            type="text"
            value={handleInput}
            placeholder="optional id, e.g. read-tree"
            spellCheck={false}
            onChange={(e) => onHandleChange(e.target.value)}
            onFocus={onFieldFocus}
            onBlur={onHandleBlur}
          />
          {handleError && (
            <div className="outcome-field-handle-error">{handleError}</div>
          )}
        </div>
      )}
      {keys.map((key) => (
        <div className="outcome-field-section" key={key}>
          {/* every section but the always-present Outcome can be removed */}
          {key !== 'outcome' && !isBeingEditedByOther && (
            <button
              className="outcome-field-remove"
              title={`Remove ${labelFor(key)} section`}
              aria-label={`Remove ${labelFor(key)} section`}
              onClick={() => removeSection(key)}
            >
              ×
            </button>
          )}
          {renderWidget(key)}
        </div>
      ))}

      {!isBeingEditedByOther && (
        <div className="outcome-add-section">
          {!adding ? (
            <button
              className="outcome-add-section-toggle"
              onClick={() => setAdding(true)}
            >
              <Icon name="plus.svg" size="small" className="not-hoverable" />
              Add section
            </button>
          ) : (
            <div className="outcome-add-section-panel">
              {addableKnown.length > 0 && (
                <div className="outcome-add-section-known">
                  {addableKnown.map((s) => (
                    <button
                      key={s.key}
                      className="outcome-add-section-chip"
                      onClick={() => addKnown(s.key, s.initial)}
                    >
                      + {labelFor(s.key)}
                    </button>
                  ))}
                </div>
              )}
              <div className="outcome-add-section-custom">
                <input
                  className="outcome-add-section-name"
                  placeholder="Custom section name"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                />
                <select
                  className="outcome-add-section-widget"
                  value={customWidget}
                  onChange={(e) => setCustomWidget(e.target.value as WidgetKind)}
                >
                  {WIDGET_CHOICES.map((w) => (
                    <option key={w.kind} value={w.kind}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <button
                  className="outcome-add-section-confirm"
                  disabled={!canAddCustom}
                  onClick={addCustom}
                >
                  Add
                </button>
              </div>
              <button className="outcome-add-section-cancel" onClick={closeAdd}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OutcomeFieldsEditor

// --- raw-JSON fallback widget (a1b) ------------------------------------------
// Keeps a local text buffer so partially-typed (invalid) JSON doesn't blow up;
// commits the parsed value on blur, and reports a non-blocking error otherwise.
type RawJsonFieldProps = {
  label: string
  iconName: string
  value: unknown
  disabled: boolean
  onChange: (value: unknown) => void
  onBlur: React.FocusEventHandler<HTMLElement>
  onFocus: React.FocusEventHandler<HTMLElement>
}

const RawJsonField: React.FC<RawJsonFieldProps> = ({
  label,
  iconName,
  value,
  disabled,
  onChange,
  onBlur,
  onFocus,
}) => {
  const serialized = JSON.stringify(value ?? null, null, 2)
  const [text, setText] = useState(serialized)
  const [error, setError] = useState<string | null>(null)

  // resync when the underlying value changes from outside (e.g. another field save)
  useEffect(() => {
    setText(serialized)
    setError(null)
  }, [serialized])

  const commit: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    try {
      onChange(JSON.parse(text))
      setError(null)
    } catch {
      setError('Invalid JSON — change not saved')
    }
    onBlur(e)
  }

  return (
    <MetadataWithLabel label={label} iconName={iconName}>
      <div className="outcome-rawjson-field">
        <TextareaAutosize
          disabled={disabled}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onFocus={onFocus}
        />
        {error && <div className="outcome-rawjson-error">{error}</div>}
      </div>
    </MetadataWithLabel>
  )
}
