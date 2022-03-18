import { connect } from 'react-redux'
import { archiveGoalFully, updateGoal } from '../../redux/persistent/projects/goals/actions'
import MultiEditBar from './MultiEditBar.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'


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
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  return {
    updateGoal: (entry, headerHash) => {
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, { headerHash, entry })
      return dispatch(
        updateGoal(cellIdString, updatedOutcome)
      )
    },
    archiveGoalFully: payload => {
      const deleteOutcomeFullyResponse = await projectsZomeApi.outcome.deleteOutcomeFully(cellId, payload)
      return dispatch(archiveGoalFully(cellIdString, deleteOutcomeFullyResponse))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiEditBar)
