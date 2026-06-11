import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Profile } from '../../types'
import { WithActionHash } from '../../types/shared'
import {
  parseFields,
  setField,
  orderedFieldKeys,
  OutcomeArtifact,
} from '../../outcomeFields'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import ArtifactsField from './ArtifactsField'
import './OutcomeFieldsEditor.scss'

// --- field-type registry -----------------------------------------------------
// Each OutcomeFields key maps to a widget kind. Text fields use the markdown
// widget; artifacts use the dedicated list editor (branch E); anything else
// falls back to a raw-JSON editor, so new/structured field types are never lost.
type WidgetKind = 'markdown' | 'artifacts' | 'rawjson'
const FIELD_WIDGET: Record<string, WidgetKind> = {
  outcome: 'markdown',
  spec: 'markdown',
  principle: 'markdown',
  artifacts: 'artifacts',
}
const widgetFor = (key: string): WidgetKind => FIELD_WIDGET[key] ?? 'rawjson'

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
  rawjson: 'file-copy.svg',
}
const FIELD_ICON: Record<string, string> = {
  completionCriteria: 'square-check.svg',
  signalType: 'tag.svg',
}
const iconFor = (key: string): string =>
  FIELD_ICON[key] ?? WIDGET_ICON[widgetFor(key)]

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
}) => {
  const fields = parseFields(description)
  const keys = orderedFieldKeys(fields)

  return (
    <div className="outcome-fields-editor">
      {keys.map((key) => {
        const kind = widgetFor(key)
        if (kind === 'markdown') {
          return (
            <MarkdownDescription
              key={key}
              label={labelFor(key)}
              iconName={iconFor(key)}
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
              key={key}
              label={labelFor(key)}
              iconName={iconFor(key)}
              disabled={isBeingEditedByOther}
              value={Array.isArray(fields[key]) ? (fields[key] as OutcomeArtifact[]) : []}
              onBlur={onFieldBlur}
              onFocus={onFieldFocus}
              onChange={(value) => onChange(setField(description, key, value))}
            />
          )
        }
        return (
          <RawJsonField
            key={key}
            label={labelFor(key)}
            iconName={iconFor(key)}
            disabled={isBeingEditedByOther}
            value={fields[key]}
            onBlur={onFieldBlur}
            onFocus={onFieldFocus}
            onChange={(value) => onChange(setField(description, key, value))}
          />
        )
      })}
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
