import {
  previewEdges,
  clearEdgesPreview,
  createConnection,
} from '../../redux/persistent/projects/edges/actions'
import { connect } from 'react-redux'
import EdgeConnectorPicker from './EdgeConnectorPicker.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'


function mapStateToProps(state) {
  const selectedGoals = state.ui.selection.selectedGoals.map(headerHash => {
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
      const edges = childrenAddresses.map(childAddress => ({
        child_address: childAddress,
        parent_address: parentAddress,
      }))
      return dispatch(previewEdges(activeProject, edges))
    },
    clearPreview: activeProject => {
      return dispatch(clearEdgesPreview(activeProject))
    },
    saveConnections: (parentAddress, childrenAddresses, cellIdString) => {
      // loop over childrenAddresses
      // use createEdge each time
    const appWebsocket = await getAppWs()
    const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      return Promise.all(
        childrenAddresses.map(childAddress => {
          // does the camel case conversion work both ways?
          const connection = await projectsZomeApi.connection.create(cellIdString, {
            parentAddress,
            childAddress,
            randomizer: Date.now(),
            isImported: false
          })
          dispatch(
            createConnection(cellIdString, connection)
          )
        })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectorPicker)
