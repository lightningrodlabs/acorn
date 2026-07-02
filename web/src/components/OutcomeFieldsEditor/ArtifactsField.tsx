import React, { useEffect, useState } from 'react'
import Icon from '../Icon/Icon'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import { OutcomeArtifact } from '../../outcomeFields'
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
  const addArtifact = () => {
    const next = [...items, { type: '', label: '', uri: '' }]
    setItems(next)
    onChange(next)
  }
  const removeArtifact = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    onChange(next)
  }

  return (
    <MetadataWithLabel label={label} iconName={iconName}>
      <div className="artifacts-field">
        {items.map((artifact, index) => {
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
              className="artifact-type"
              disabled={disabled}
              placeholder="type"
              value={artifact.type}
              onChange={(e) => editField(index, 'type', e.target.value)}
              onBlur={commit}
              onFocus={onFocus}
            />
            <input
              className="artifact-label"
              disabled={disabled}
              placeholder="label"
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
        })}
        {!disabled && (
          <button type="button" className="artifact-add" onClick={addArtifact}>
            <Icon name="plus.svg" size="small" className="not-hoverable" />
            <span>Add artifact</span>
          </button>
        )}
      </div>
    </MetadataWithLabel>
  )
}

export default ArtifactsField
