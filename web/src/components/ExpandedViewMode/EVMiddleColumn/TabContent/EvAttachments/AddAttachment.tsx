import React from 'react'
import './AddAttachment.scss'
import Icon from '../../../../Icon/Icon'

export type AddAttachmentProps = {
  // proptypes
  onAddAttachment: () => void
}

const AddAttachment: React.FC<AddAttachmentProps> = ({
  // prop declarations
  onAddAttachment,
}) => {
  return (
    <div className="add-outcome-child-wrapper">
      <div 
        className="add-attachment-icon-wrapper"
        onClick={onAddAttachment}
      >
        <Icon
          name="plus.svg"
          size="small"
          className="attachment-icon"
        />
      </div>
      <div className="attachment-placeholder-text">
        Add an attachment
      </div>
    </div>
  )
}

export default AddAttachment
