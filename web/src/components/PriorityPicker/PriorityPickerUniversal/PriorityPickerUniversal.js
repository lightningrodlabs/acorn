import React, { useState } from 'react'
import './PriorityPickerUniversal.css'
import { connect } from 'react-redux'

import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import ToggleSwitch from '../../ToggleSwitch/ToggleSwitch'

function PriorityPickerUniversal({
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

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const topPriorityGoals = projectMeta.top_priority_goals || []
  // see if the goal of interest is listed in the set
  // of top priority goals for the project
  const isTopPriorityGoal = !!topPriorityGoals.find(headerHash => headerHash === goalAddress)
  return {
    whoami: state.whoami,
    isTopPriorityGoal,
    projectMeta,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateProjectMeta: (entry, headerHash) => {
      return dispatch(
        updateProjectMeta.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerUniversal)
