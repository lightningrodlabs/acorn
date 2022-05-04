import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Profile } from '../../types'
import { WithHeaderHash } from '../../types/shared'

import EditingOverlay from '../EditingOverlay/EditingOverlay'
import MetadataWithLabel from '../MetadataWithLabel/MetadataWithLabel'
import './MarkdownDescription.scss'

export type MarkdownDescriptionProps = {
  isBeingEditedByOther: boolean
  personEditing: WithHeaderHash<Profile>
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>
  onFocus: React.FocusEventHandler<HTMLTextAreaElement>
  onChange: (value: string) => void
  value: string
}

const MarkdownDescription: React.FC<MarkdownDescriptionProps> = ({
  isBeingEditedByOther,
  personEditing,
  onBlur,
  onFocus,
  onChange,
  value,
}) => {
  return (
    <MetadataWithLabel label="Description" iconName="text-align-left.svg">
      <div className="markdown-description-wrapper">
        <EditingOverlay
          isBeingEditedByOther={isBeingEditedByOther}
          personEditing={personEditing}
        >
          <div className="markdown-description-content">
            <TextareaAutosize
              disabled={isBeingEditedByOther}
              placeholder="Add description here"
              value={value}
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
            />
          </div>
        </EditingOverlay>
      </div>
    </MetadataWithLabel>
  )
}

export default MarkdownDescription
