import {
  previewEdges,
  clearEdgesPreview,
  createEdge,
} from '../../redux/persistent/projects/edges/actions'
import { connect } from 'react-redux'
import EdgeConnectorPicker from './EdgeConnectorPicker.component'

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
      return Promise.all(
        childrenAddresses.map(childAddress =>
          dispatch(
            createEdge.create({
              cellIdString,
              payload: {
                child_address: childAddress,
                parent_address: parentAddress,
                randomizer: Date.now(),
                is_imported: false
              },
            })
          )
        )
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectorPicker)
