import React, { useState } from 'react'
import ToggleSwitch from '../../ToggleSwitch/ToggleSwitch'
import './PriorityPickerUniversal.scss'

export default function PriorityPickerUniversal({
  projectMeta,
  outcomeActionHash,
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
    let projectMetaAddress = toPass.actionHash
    delete toPass.actionHash
    if (e.target.checked) {
      setPendingState(true)
      toPass.topPriorityOutcomes = toPass.topPriorityOutcomes.concat([outcomeActionHash])
      await updateProjectMeta(toPass, projectMetaAddress)
    } else {
      setPendingState(false)
      toPass.topPriorityOutcomes = toPass.topPriorityOutcomes.filter(actionHash => actionHash !== outcomeActionHash)
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
