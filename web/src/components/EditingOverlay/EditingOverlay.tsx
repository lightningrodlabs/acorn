import React from 'react'
import { Profile } from '../../types'
import { WithActionHash } from '../../types/shared'
import Avatar from '../Avatar/Avatar'
import './EditingOverlay.scss'

export type EditingOverlayProps = {
  isBeingEditedByOther: boolean
  personEditing: WithActionHash<Profile>
}

const EditingOverlay: React.FC<EditingOverlayProps> = ({
  isBeingEditedByOther,
  personEditing,
  children,
}) => {
  return (
    <div className="editing-overlay">
      {isBeingEditedByOther && (
        <div className="editing-overlay-avatar-wrapper">
          <Avatar
            withStatusBorder
            size="small-medium"
            firstName={personEditing.firstName}
            lastName={personEditing.lastName}
            avatarUrl={personEditing.avatarUrl}
            imported={personEditing.isImported}
            selfAssignedStatus={personEditing.status}
          />
        </div>
      )}
      <div className={isBeingEditedByOther ? 'editing-overlay-animation' : ''}>
        {children}
      </div>
    </div>
  )
}

export default EditingOverlay
