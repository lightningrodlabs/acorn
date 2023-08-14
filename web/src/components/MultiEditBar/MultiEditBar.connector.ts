import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  deleteOutcomeFully,
  updateOutcome,
} from '../../redux/persistent/projects/outcomes/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import MultiEditBar from './MultiEditBar.component'

function mapStateToProps(state: RootState) {
  const {
    ui: { activeProject },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  return {
    agentAddress: state.agentAddress,
    selectedOutcomes: state.ui.selection.selectedOutcomes.map((actionHash) => {
      const outcome = outcomes[actionHash]
      return outcome
    }),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  let cellId
  if (cellIdString) {
    cellId = cellIdFromString(cellIdString)
  }
  return {
    updateOutcome: async (entry, actionHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        actionHash,
        entry,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    deleteOutcomeFully: async (payload) => {
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
