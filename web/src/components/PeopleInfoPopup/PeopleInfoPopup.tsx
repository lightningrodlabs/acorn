import React, { useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import './PeopleInfoPopup.scss'

export default function SquirrelInfoPopup({
  squirrel,
  onClose,
  deleteOutcomeMember,
}) {
  const ref = useRef()
  useOnClickOutside(ref, onClose)

  // TODO : connect "squirrel-info-popup-name" div to the member's profile page
  // TODO : connect "remove from outcome" button to holochain
  return (
    <div className="squirrel-info-popup-wrapper" ref={ref}>
      <div className="squirrel-info-popup-nameANDhandle">
        <div className="squirrel-info-popup-name">
          {squirrel.firstName} {squirrel.lastName}{' '}
          {squirrel.isImported ? <div>(Imported)</div> : ''}
        </div>
        <div className="squirrel-info-popup-handle">{squirrel.handle}</div>
      </div>
      <div
        className="remove-squirrel-btn"
        onClick={(e) => {
          onClose()
          deleteOutcomeMember(squirrel.outcomeMemberAddress)
        }}
      >
        Remove from outcome
      </div>
    </div>
  )
}
