import './PriorityPicker.scss'
import { connect } from 'react-redux'
import PriorityPicker from './PriorityPicker.component'

function mapStateToProps(state, ownProps) {
  const { projectId, outcomeAddress } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const priorityMode = projectMeta.priority_mode
  return {
    whoami: state.whoami,
    outcomeAddress,
    projectId,
    priorityMode
  }
}

function mapDispatchToProps(_dispatch, _ownProps) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPicker)
