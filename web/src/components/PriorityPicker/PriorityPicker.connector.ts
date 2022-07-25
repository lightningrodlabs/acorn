import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import PriorityPicker from './PriorityPicker.component'

function mapStateToProps(state: RootState, ownProps) {
  const { projectId, outcomeActionHash } = ownProps
  // filters all the OutcomeVotes down to a list
  // of only the Votes on the selected Outcome
  const projectMeta = state.projects.projectMeta[projectId]
  const priorityMode = projectMeta ? projectMeta.priorityMode : undefined
  return {
    whoami: state.whoami,
    outcomeActionHash,
    projectId,
    priorityMode,
  }
}

function mapDispatchToProps(_dispatch, _ownProps) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPicker)
