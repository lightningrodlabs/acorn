import React, { useState } from 'react'
import './PriorityPickerUniversal.css'
import { connect } from 'react-redux'
import Switch from '@material-ui/core/Switch'

import { updateProjectMeta } from '../../../projects/project-meta/actions'

function PriorityPickerUniversal({
  projectMeta,
  goalAddress,
  isTopPriorityGoal,
  updateProjectMeta,
}) {
  const [pending, setPending] = useState(false)
  const onChange = async (e) => {
    if (pending) return
    setPending(true)
    // clone the object from state for
    // modifying it to send over the api
    const toPass = {
      ...projectMeta
    }
    let projectMetaAddress = toPass.address
    delete toPass.address
    if (e.target.checked) {
      toPass.top_priority_goals = toPass.top_priority_goals.concat([goalAddress])
      await updateProjectMeta(toPass, projectMetaAddress)
    } else {
      toPass.top_priority_goals = toPass.top_priority_goals.filter(address => address !== goalAddress)
      await updateProjectMeta(toPass, projectMetaAddress)
    }
    setPending(false)
  }
  return (
    <div className="priority-picker-universal">
      <div className="priority-picker-universal-label">This goal is top priority</div>
      {/* TODO: wire up onChange */}
      <Switch color="primary" checked={isTopPriorityGoal} onChange={onChange} />
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const topPriorityGoals = projectMeta.top_priority_goals || []
  // see if the goal of interest is listed in the set
  // of top priority goals for the project
  const isTopPriorityGoal = !!topPriorityGoals.find(address => address === goalAddress)
  return {
    whoami: state.whoami,
    isTopPriorityGoal,
    projectMeta,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateProjectMeta: (entry, address) => {
      return dispatch(
        updateProjectMeta.create({ cellIdString, payload: { entry, address } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerUniversal)
