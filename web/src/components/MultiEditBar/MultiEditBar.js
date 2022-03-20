import { connect } from 'react-redux'
import {
  deleteOutcomeFully,
  updateOutcome,
} from '../../redux/persistent/projects/outcomes/actions'
import MultiEditBar from './MultiEditBar.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state) {
  const {
    ui: { activeProject },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  return {
    agentAddress: state.agentAddress,
    selectedOutcomes: state.ui.selection.selectedOutcomes.map(
      (headerHash) => outcomes[headerHash]
    ),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    updateOutcome: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        headerHash,
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
