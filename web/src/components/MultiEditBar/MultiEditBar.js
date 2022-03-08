import { connect } from 'react-redux'
import { archiveGoalFully, updateGoal } from '../../redux/persistent/projects/goals/actions'
import MultiEditBar from './MultiEditBar.component'


function mapStateToProps(state) {
  const {
    ui: { activeProject },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  return {
    agentAddress: state.agentAddress,
    selectedGoals: state.ui.selection.selectedGoals.map(
      headerHash => goals[headerHash]
    ),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateGoal: (entry, headerHash) => {
      return dispatch(
        updateGoal.create({ cellIdString, payload: { headerHash, entry } })
      )
    },
    archiveGoalFully: payload => {
      return dispatch(archiveGoalFully.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiEditBar)
