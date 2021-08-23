import React from 'react'
import './PriorityPicker.css'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { connect } from 'react-redux'
import { PriorityModeOptions } from '../../constants'
import PriorityPickerUniversal from './PriorityPickerUniversal/PriorityPickerUniversal'
import PriorityPickerVote from './PriorityPickerVote/PriorityPickerVote'

function PriorityPicker({
  projectId,
  goalAddress,
  priorityMode,
  onClose,
}) {
  const isUniversal = priorityMode === PriorityModeOptions.Universal
  return (
    <PickerTemplate
      className={`priority-picker-wrapper ${isUniversal ? "universal-priority" : "vote-priority"}`}
      heading='Priority'
      onClose={onClose}>
      {isUniversal
        ? <PriorityPickerUniversal projectId={projectId} goalAddress={goalAddress} />
        : <PriorityPickerVote projectId={projectId} goalAddress={goalAddress} />}
    </PickerTemplate>
  )
}

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  // filters all the GoalVotes down to a list
  // of only the Votes on the selected Goal
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const priorityMode = projectMeta.priority_mode
  return {
    whoami: state.whoami,
    goalAddress,
    projectId,
    priorityMode
  }
}

function mapDispatchToProps(_dispatch, _ownProps) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPicker)
