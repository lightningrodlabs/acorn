import { connect } from 'react-redux'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import {
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
} from '../../redux/ephemeral/connection-connector/actions'
import ConnectionConnectors from './ConnectionConnectors.component'

function mapStateToProps(state) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  const connections = state.projects.connections[activeProject] || {}
  const coordinates = state.ui.layout
  const selectedOutcomeAddresses = state.ui.selection.selectedOutcomes
  const hoveredOutcomeAddress = state.ui.hover.hoveredOutcome
  const {
    fromAddress,
    relation,
    toAddress,
    existingParentConnectionAddress,
  } = state.ui.connectionConnector
  let connectorAddresses
  // only set validToAddresses if we are actually utilizing the connection connector right now
  if (fromAddress) {
    // connector addresses includes the outcome we are connecting from
    // to all the possible outcomes we can connect to validly
    connectorAddresses = [fromAddress].concat(
      state.ui.connectionConnector.validToAddresses
    )
  } else if (hoveredOutcomeAddress) {
    connectorAddresses = selectedOutcomeAddresses
      .concat([hoveredOutcomeAddress])
      // deduplicate
      .filter((v, i, a) => a.indexOf(v) === i)
  } else {
    // fall back is to show the dots on any currently selected outcomes
    connectorAddresses = selectedOutcomeAddresses
  }

  return {
    activeProject,
    coordinates,
    coordsCanvasToPage: (coordinate) => {
      return coordsCanvasToPage(coordinate, translate, scale)
    },
    outcomes,
    connections: Object.values(connections), // convert from object to array
    outcomeAddresses: Object.keys(outcomes), // convert from object to array
    fromAddress,
    relation,
    toAddress,
    existingParentConnectionAddress,
    connectorAddresses,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setConnectionConnectorFrom: (address, relation, validToAddresses, existingParentConnectionAddress) => {
      return dispatch(setConnectionConnectorFrom(address, relation, validToAddresses, existingParentConnectionAddress))
    },
    setConnectionConnectorTo: (address) => {
      return dispatch(setConnectionConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionConnectors)
