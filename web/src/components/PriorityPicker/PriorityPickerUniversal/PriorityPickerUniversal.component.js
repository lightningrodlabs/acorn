import React, { useState } from 'react'
import './PriorityPickerUniversal.scss'
import ToggleSwitch from '../../ToggleSwitch/ToggleSwitch'

export default function PriorityPickerUniversal({
  projectMeta,
  outcomeAddress,
  isTopPriorityOutcome,
  updateProjectMeta,
}) {
  const [pending, setPending] = useState(false)
  // can be null, true, or false
  const [pendingState, setPendingState] = useState(null)
  const onChange = async (e) => {
    if (pending) return
    setPending(true)
    // clone the object from state for
    // modifying it to send over the api
    const toPass = {
      ...projectMeta
    }
    let projectMetaAddress = toPass.headerHash
    delete toPass.headerHash
    if (e.target.checked) {
      setPendingState(true)
      toPass.top_priority_outcomes = toPass.top_priority_outcomes.concat([outcomeAddress])
      await updateProjectMeta(toPass, projectMetaAddress)
    } else {
      setPendingState(false)
      toPass.top_priority_outcomes = toPass.top_priority_outcomes.filter(headerHash => headerHash !== outcomeAddress)
      await updateProjectMeta(toPass, projectMetaAddress)
    }
    setPending(false)
    setPendingState(null)
  }

  return (
    <div className="priority-picker-universal">
      <div className="priority-picker-universal-label">This outcome is top priority</div>
      <ToggleSwitch checked={pending ? pendingState : isTopPriorityOutcome} onChange={onChange} />
    </div>
  )
}
