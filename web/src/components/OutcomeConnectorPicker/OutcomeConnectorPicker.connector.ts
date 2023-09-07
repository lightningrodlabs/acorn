import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import { createConnection } from '../../redux/persistent/projects/connections/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import OutcomeConnectorPicker from './OutcomeConnectorPicker.component'

function mapStateToProps(state: RootState) {
  const selectedOutcomes = state.ui.selection.selectedOutcomes.map(
    (actionHash) => {
      return state.projects.outcomes[state.ui.activeProject][actionHash]
    }
  )

  // use a bit of defensive coding ( || {} ) during loading
  const connections = Object.values(
    state.projects.connections[state.ui.activeProject] || {}
  )

  return {
    selectedOutcomes,
    connections,
    activeProject: state.ui.activeProject,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    saveConnections: async (
      parentActionHash,
      childrenAddresses,
      cellIdString
    ) => {
      // loop over childrenAddresses
      // use createConnection each time
      const cellId = cellIdFromString(cellIdString)
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      return Promise.all(
        childrenAddresses.map(async (childActionHash) => {
          const connection = await projectsZomeApi.connection.create(cellId, {
            parentActionHash,
            childActionHash,
            siblingOrder: 0,
            randomizer: Date.now(),
            isImported: false,
          })
          dispatch(createConnection(cellIdString, connection))
        })
      )
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutcomeConnectorPicker)
