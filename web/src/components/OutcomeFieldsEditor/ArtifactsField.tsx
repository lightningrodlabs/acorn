import React, { useEffect, useState } from 'react'
import Icon from '../Icon/Icon'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import { OutcomeArtifact } from '../../outcomeFields'
import { groupArtifacts, IndexedArtifact } from '../../artifactGroups'
import {
  conversationTranscript,
  isConversationArtifact,
} from '../../harness/conversationArtifact'
import {
  isConversationRef,
  conversationRefTarget,
} from '../../harness/conversationDedup'
import ConversationArtifact from './ConversationArtifact'
import RichText from '../RichText/RichText'

// The artifacts list editor (branch E / e1): a node's typed artifacts — the
// clarity inputs (designs, docs, links) and agent workproduct outputs — each with
// a type, a label, and a uri. Replaces the raw-JSON fallback for the artifacts field
// (and generalizes the old single GitHub link).

const isHttp = (uri: string): boolean => /^https?:\/\//i.test(uri.trim())

export type ArtifactsFieldProps = {
  label: string
  iconName: string
  value: OutcomeArtifact[]
  disabled: boolean
  onChange: (value: OutcomeArtifact[]) => void
  onBlur: React.FocusEventHandler<HTMLElement>
  onFocus: React.FocusEventHandler<HTMLElement>
}

const ArtifactsField: React.FC<ArtifactsFieldProps> = ({
  label,
  iconName,
  value,
  disabled,
  onChange,
  onBlur,
  onFocus,
}) => {
  // Local buffer so per-keystroke edits don't churn the whole description; text
  // edits commit on blur, while add/remove commit immediately.
  const serialized = JSON.stringify(value ?? [])
  const [items, setItems] = useState<OutcomeArtifact[]>(value ?? [])

  useEffect(() => {
    setItems(value ?? [])
  }, [serialized])

  const editField = (index: number, key: keyof OutcomeArtifact, fieldValue: string) => {
    setItems(items.map((it, i) => (i === index ? { ...it, [key]: fieldValue } : it)))
  }
  const commit: React.FocusEventHandler<HTMLInputElement> = (e) => {
    onChange(items)
    onBlur(e)
  }
  // Two add paths so the human picks the group at add time (the row no longer shows
  // the `type` field). An input artifact gets an empty type (→ Clarity inputs group);
  // an output gets 'workproduct' (→ Workproduct group). A human may add either.
  const addArtifactOfGroup = (type: string) => {
    const next = [...items, { type, label: '', uri: '' }]
    setItems(next)
    onChange(next)
  }
  const removeArtifact = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    onChange(next)
  }

  const renderRow = (artifact: OutcomeArtifact, index: number) => {
          // A conversation artifact carries a captured transcript as its value —
          // render it as a readable thread, not the editable type/label/uri row.
          // Detect by TYPE (not by a successful parse) so an empty/placeholder or
          // malformed one still reads as a conversation, with an empty state.
          if (isConversationRef(artifact)) {
            // A pointer to a conversation held on another node — a clickable
            // [[ref]] link, never a copy of the transcript.
            const ref = conversationRefTarget(artifact)
            return (
              <div className="artifact-row artifact-row--conversation-ref" key={index}>
                <RichText
                  className="conversation-ref-note"
                  source={`↪ Conversation retained on [[${ref}]] — open it there.`}
                />
                {!disabled && (
                  <Icon
                    name="delete-bin.svg"
                    size="small"
                    className="light-grey artifact-remove"
                    onClick={() => removeArtifact(index)}
                  />
                )}
              </div>
            )
          }
          if (isConversationArtifact(artifact)) {
            const transcript = conversationTranscript(artifact)
            return (
              // position:relative + .artifact-remove absolute top-right (SCSS) so
              // the delete control sits at the TOP of a long thread, not buried
              // in the middle of it.
              <div className="artifact-row artifact-row--conversation" key={index}>
                {!disabled && (
                  <Icon
                    name="delete-bin.svg"
                    size="small"
                    className="light-grey artifact-remove"
                    onClick={() => removeArtifact(index)}
                  />
                )}
                <ConversationArtifact label={artifact.label} transcript={transcript} />
              </div>
            )
          }
          return (
          <div className="artifact-row" key={index}>
            <input
              className="artifact-label"
              disabled={disabled}
              placeholder="kind — e.g. PR / modified-code / doc"
              value={artifact.label}
              onChange={(e) => editField(index, 'label', e.target.value)}
              onBlur={commit}
              onFocus={onFocus}
            />
            <input
              className="artifact-uri"
              disabled={disabled}
              placeholder="uri / path / link"
              value={artifact.uri}
              onChange={(e) => editField(index, 'uri', e.target.value)}
              onBlur={commit}
              onFocus={onFocus}
            />
            {isHttp(artifact.uri) && (
              <a href={artifact.uri} target="_blank" rel="noreferrer" className="artifact-open">
                <Icon name="external-link.svg" size="small" className="not-hoverable" />
              </a>
            )}
            {!disabled && (
              <Icon
                name="delete-bin.svg"
                size="small"
                className="light-grey artifact-remove"
                onClick={() => removeArtifact(index)}
              />
            )}
          </div>
          )
  }

  // Group into clarity INPUTS vs agent-produced work-product OUTPUTS, each rendered
  // as its own titled SUBSECTION (a bounded block, not a bare label). The Workproduct
  // subsection appears whenever there are any outputs; the Clarity-inputs heading
  // appears only alongside it, so a node carrying only inputs stays clean (no lone
  // header) and reads exactly as before.
  const { input, output } = groupArtifacts(items)
  const hasOutputs = output.length > 0
  const renderGroup = (
    rows: IndexedArtifact[],
    groupKey: string,
    groupLabel: string,
    showLabel: boolean
  ) => {
    if (rows.length === 0) return null
    return (
      <div className={`artifact-group artifact-group--${groupKey}`}>
        {showLabel && <div className="artifact-group-label">{groupLabel}</div>}
        {rows.map(({ artifact, index }) => renderRow(artifact, index))}
      </div>
    )
  }

  return (
    <MetadataWithLabel label={label} iconName={iconName}>
      <div className="artifacts-field">
        {/* inputs are labelled only when there is also a workproduct group to distinguish from */}
        {renderGroup(input, 'input', 'Clarity inputs', hasOutputs)}
        {renderGroup(output, 'output', 'Workproduct', true)}
        {!disabled && (
          <div className="artifact-add-row">
            <button type="button" className="artifact-add" onClick={() => addArtifactOfGroup('')}>
              <Icon name="plus.svg" size="small" className="not-hoverable" />
              <span>Add input</span>
            </button>
            <button
              type="button"
              className="artifact-add"
              onClick={() => addArtifactOfGroup('workproduct')}
            >
              <Icon name="plus.svg" size="small" className="not-hoverable" />
              <span>Add output</span>
            </button>
          </div>
        )}
      </div>
    </MetadataWithLabel>
  )
}

export default ArtifactsField
