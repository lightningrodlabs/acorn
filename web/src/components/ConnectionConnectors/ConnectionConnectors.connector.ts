import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
} from '../../redux/ephemeral/connection-connector/actions'
import ConnectionConnectors from './ConnectionConnectors.component'
import { ActionHashB64 } from '../../types/shared'

function mapStateToProps(state: RootState) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  const connections = state.projects.connections[activeProject] || {}
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  const coordinates = state.ui.layout
  const hoveredOutcomeAddress = state.ui.hover.hoveredOutcome
  const {
    fromAddress,
    relation,
    toAddress,
    existingParentConnectionAddress,
  } = state.ui.connectionConnector
  let connectorAddresses: ActionHashB64[] = []
  // only set validToAddresses if we are actually utilizing the connection connector right now
  if (fromAddress) {
    // connector addresses includes the outcome we are connecting from
    // to all the possible outcomes we can connect to validly
    connectorAddresses = [fromAddress].concat(
      state.ui.connectionConnector.validToAddresses
    )
  } else if (hoveredOutcomeAddress) {
    connectorAddresses = [hoveredOutcomeAddress]
  }

  return {
    activeProject,
    projectTags,
    translate,
    zoomLevel: scale,
    coordinates,
    outcomes,
    connections: Object.values(connections), // convert from object to array
    outcomeActionHashes: Object.keys(outcomes), // convert from object to array
    fromAddress,
    relation,
    toAddress,
    existingParentConnectionAddress,
    connectorAddresses,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setConnectionConnectorFrom: (
      address,
      relation,
      validToAddresses,
      existingParentConnectionAddress
    ) => {
      return dispatch(
        setConnectionConnectorFrom(
          address,
          relation,
          validToAddresses,
          existingParentConnectionAddress
        )
      )
    },
    setConnectionConnectorTo: (address) => {
      return dispatch(setConnectionConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectionConnectors)
