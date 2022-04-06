import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  previewConnections,
  clearConnectionsPreview,
  createConnection,
} from '../../redux/persistent/projects/connections/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import ConnectionConnectorPicker from './ConnectionConnectorPicker.component'

function mapStateToProps(state: RootState) {
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
    previewConnections: (parentHeaderHash, childrenAddresses, activeProject) => {
      const connections = childrenAddresses.map((childHeaderHash) => ({
        childHeaderHash,
        parentHeaderHash,
      }))
      return dispatch(previewConnections(activeProject, connections))
    },
    clearPreview: (activeProject) => {
      return dispatch(clearConnectionsPreview(activeProject))
    },
    saveConnections: async (parentHeaderHash, childrenAddresses, cellIdString) => {
      // loop over childrenAddresses
      // use createConnection each time
      const cellId = cellIdFromString(cellIdString)
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      return Promise.all(
        childrenAddresses.map(async (childHeaderHash) => {
          // does the camel case conversion work both ways?
          const connection = await projectsZomeApi.connection.create(
            cellId,
            {
              parentHeaderHash,
              childHeaderHash,
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
