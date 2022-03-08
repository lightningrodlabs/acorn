import React, { useState } from 'react'
import './PriorityPickerUniversal.css'
import ToggleSwitch from '../../ToggleSwitch/ToggleSwitch'

export default function PriorityPickerUniversal({
  projectMeta,
  goalAddress,
  isTopPriorityGoal,
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
      toPass.top_priority_goals = toPass.top_priority_goals.concat([goalAddress])
      await updateProjectMeta(toPass, projectMetaAddress)
    } else {
      setPendingState(false)
      toPass.top_priority_goals = toPass.top_priority_goals.filter(headerHash => headerHash !== goalAddress)
      await updateProjectMeta(toPass, projectMetaAddress)
    }
    setPending(false)
    setPendingState(null)
  }

  return (
    <div className="priority-picker-universal">
      <div className="priority-picker-universal-label">This goal is top priority</div>
      <ToggleSwitch checked={pending ? pendingState : isTopPriorityGoal} onChange={onChange} />
    </div>
  )
}
