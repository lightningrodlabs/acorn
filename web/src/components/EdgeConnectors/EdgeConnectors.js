import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import {
  setEdgeConnectorFrom,
  setEdgeConnectorTo,
} from '../../redux/ephemeral/edge-connector/actions'
import EdgeConnectors from './EdgeConnectors.component'

function mapStateToProps(state) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  const edges = state.projects.edges[activeProject] || {}
  const coordinates = state.ui.layout
  const selectedGoalAddresses = state.ui.selection.selectedGoals
  const hoveredGoalAddress = state.ui.hover.hoveredGoal
  const {
    fromAddress,
    relation,
    toAddress,
    existingParentEdgeAddress,
  } = state.ui.edgeConnector
  let connectorAddresses
  // only set validToAddresses if we are actually utilizing the edge connector right now
  if (fromAddress) {
    // connector addresses includes the goal we are connecting from
    // to all the possible goals we can connect to validly
    connectorAddresses = [fromAddress].concat(
      state.ui.edgeConnector.validToAddresses
    )
  } else if (hoveredGoalAddress) {
    connectorAddresses = selectedGoalAddresses
      .concat([hoveredGoalAddress])
      // deduplicate
      .filter((v, i, a) => a.indexOf(v) === i)
  } else {
    // fall back is to show the dots on any currently selected goals
    connectorAddresses = selectedGoalAddresses
  }

  return {
    activeProject,
    coordinates,
    coordsCanvasToPage: (coordinate) => {
      return coordsCanvasToPage(coordinate, translate, scale)
    },
    goals,
    edges: Object.values(edges), // convert from object to array
    goalAddresses: Object.keys(goals), // convert from object to array
    fromAddress,
    relation,
    toAddress,
    existingParentEdgeAddress,
    connectorAddresses,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setEdgeConnectorFrom: (address, relation, validToAddresses, existingParentEdgeAddress) => {
      return dispatch(setEdgeConnectorFrom(address, relation, validToAddresses, existingParentEdgeAddress))
    },
    setEdgeConnectorTo: (address) => {
      return dispatch(setEdgeConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectors)
