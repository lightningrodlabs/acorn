import './PriorityPicker.css'
import { connect } from 'react-redux'
import PriorityPicker from './PriorityPicker.component'

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
