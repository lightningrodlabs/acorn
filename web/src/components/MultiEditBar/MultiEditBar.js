import { connect } from 'react-redux'
import {
  deleteOutcomeFully,
  updateOutcome,
} from '../../redux/persistent/projects/goals/actions'
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
      (headerHash) => goals[headerHash]
    ),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    updateGoal: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
        entry,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    archiveGoalFully: async (payload) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const deleteOutcomeFullyResponse = await projectsZomeApi.outcome.deleteOutcomeFully(
        cellId,
        payload
      )
      return dispatch(
        deleteOutcomeFully(cellIdString, deleteOutcomeFullyResponse)
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiEditBar)
