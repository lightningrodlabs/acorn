import {
  previewConnections,
  clearConnectionsPreview,
  createConnection,
} from '../../redux/persistent/projects/edges/actions'
import { connect } from 'react-redux'
import EdgeConnectorPicker from './EdgeConnectorPicker.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'

function mapStateToProps(state) {
  const selectedGoals = state.ui.selection.selectedGoals.map((headerHash) => {
    return state.projects.goals[state.ui.activeProject][headerHash]
  })

  const edges = Object.values(state.projects.edges[state.ui.activeProject])

  return {
    selectedGoals,
    edges,
    activeProject: state.ui.activeProject,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    previewConnections: (parentAddress, childrenAddresses, activeProject) => {
      const edges = childrenAddresses.map((childAddress) => ({
        child_address: childAddress,
        parent_address: parentAddress,
      }))
      return dispatch(previewConnections(activeProject, edges))
    },
    clearPreview: (activeProject) => {
      return dispatch(clearConnectionsPreview(activeProject))
    },
    saveConnections: async (parentAddress, childrenAddresses, cellIdString) => {
      // loop over childrenAddresses
      // use createConnection each time
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      return Promise.all(
        childrenAddresses.map(async (childAddress) => {
          // does the camel case conversion work both ways?
          const connection = await projectsZomeApi.connection.create(
            cellIdString,
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

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectorPicker)
