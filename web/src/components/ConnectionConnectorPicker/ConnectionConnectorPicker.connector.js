import {
  previewConnections,
  clearConnectionsPreview,
  createConnection,
} from '../../redux/persistent/projects/connections/actions'
import { connect } from 'react-redux'
import ConnectionConnectorPicker from './ConnectionConnectorPicker.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

function mapStateToProps(state) {
  const selectedOutcomes = state.ui.selection.selectedOutcomes.map((headerHash) => {
    return state.projects.outcomes[state.ui.activeProject][headerHash]
  })

  const connections = Object.values(state.projects.connections[state.ui.activeProject])

  return {
    selectedOutcomes,
    connections,
    activeProject: state.ui.activeProject,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    previewConnections: (parentAddress, childrenAddresses, activeProject) => {
      const connections = childrenAddresses.map((childAddress) => ({
        child_address: childAddress,
        parent_address: parentAddress,
      }))
      return dispatch(previewConnections(activeProject, connections))
    },
    clearPreview: (activeProject) => {
      return dispatch(clearConnectionsPreview(activeProject))
    },
    saveConnections: async (parentAddress, childrenAddresses, cellIdString) => {
      // loop over childrenAddresses
      // use createConnection each time
      const cellId = cellIdFromString(cellIdString)
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      return Promise.all(
        childrenAddresses.map(async (childAddress) => {
          // does the camel case conversion work both ways?
          const connection = await projectsZomeApi.connection.create(
            cellId,
            {
              parentAddress,
              childAddress,
              randomizer: Date.now(),
              isImported: false,
            }
          )
          dispatch(createConnection(cellIdString, connection))
        })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionConnectorPicker)
