import React, { useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { AssigneeWithActionHash } from '../../types'
import { ActionHashB64 } from '../../types/shared'
import './PersonInfoPopup.scss'

export type PersonInfoPopupProps = {
  person: AssigneeWithActionHash
  onClose: () => void
  deleteOutcomeMember: (actionHash: ActionHashB64) => Promise<void>
}

const PersonInfoPopup: React.FC<PersonInfoPopupProps> = ({
  person,
  onClose,
  deleteOutcomeMember,
}) => {
  const ref = useRef()
  useOnClickOutside(ref, onClose)

  // TODO : connect "person-info-popup-name" div to the member's profile page
  // TODO : connect "remove from outcome" button to holochain
  return (
    <div className="person-info-popup-wrapper" ref={ref}>
      <div className="person-info-popup-nameANDhandle">
        <div className="person-info-popup-name">
          {person.profile.firstName} {person.profile.lastName}{' '}
          {person.profile.isImported ? <div>(Imported)</div> : ''}
        </div>
        <div className="person-info-popup-handle">{person.profile.handle}</div>
      </div>
      <div
        className="remove-person-btn"
        onClick={() => {
          onClose()
          deleteOutcomeMember(person.outcomeMemberActionHash)
        }}
      >
        Remove from outcome
      </div>
    </div>
  )
}

export default PersonInfoPopup
