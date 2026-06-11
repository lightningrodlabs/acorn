import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import ReactMarkdown from 'react-markdown'
import { Profile } from '../../types'
import { WithActionHash } from '../../types/shared'

import EditingOverlay from '../EditingOverlay/EditingOverlay'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import './MarkdownDescription.scss'

export type MarkdownDescriptionProps = {
  isBeingEditedByOther: boolean
  personEditing: WithActionHash<Profile>
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>
  onFocus: React.FocusEventHandler<HTMLTextAreaElement>
  onChange: (value: string) => void
  value: string
  // a text field can label/icon/placeholder itself; defaults preserve prior behavior
  label?: string
  placeholder?: string
  iconName?: string
}

// Renders a markdown text field formatted in display mode, switching to a plain
// textarea on click for editing (markdown source in, formatted out).
const MarkdownDescription: React.FC<MarkdownDescriptionProps> = ({
  isBeingEditedByOther,
  personEditing,
  onBlur,
  onFocus,
  onChange,
  value,
  label = 'Description',
  placeholder = 'Add description here (markdown supported)',
  iconName = 'text-align-left.svg',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const showEditor = isEditing && !isBeingEditedByOther

  const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    setIsEditing(false)
    onBlur(e)
  }

  return (
    <MetadataWithLabel label={label} iconName={iconName}>
      <div className="markdown-description-wrapper">
        <EditingOverlay
          isBeingEditedByOther={isBeingEditedByOther}
          personEditing={personEditing}
        >
          <div className="markdown-description-content">
            {showEditor ? (
              <TextareaAutosize
                autoFocus
                disabled={isBeingEditedByOther}
                placeholder={placeholder}
                value={value}
                onBlur={handleBlur}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
              />
            ) : (
              <div
                className="markdown-description-rendered"
                onClick={() => !isBeingEditedByOther && setIsEditing(true)}
              >
                {value ? (
                  <ReactMarkdown>{value}</ReactMarkdown>
                ) : (
                  <span className="markdown-description-placeholder">
                    {placeholder}
                  </span>
                )}
              </div>
            )}
          </div>
        </EditingOverlay>
      </div>
    </MetadataWithLabel>
  )
}

export default MarkdownDescription
