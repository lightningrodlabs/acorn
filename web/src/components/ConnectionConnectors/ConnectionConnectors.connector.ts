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
      layout: coordinates,
      hover: { hoveredOutcome: hoveredOutcomeAddress },
      connectionConnector: {
        fromAddress,
        relation,
        toAddress,
        existingParentConnectionAddress,
        validToAddresses,
      },
      selection: { selectedOutcomes },
    },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  let connectorAddresses: ActionHashB64[] = []
  // only set validToAddresses if we are actually utilizing the connection connector right now
  if (fromAddress) {
    // connector addresses includes the outcome we are connecting from
    // to all the possible outcomes we can connect to validly
    connectorAddresses = [fromAddress].concat(validToAddresses)
  }
  // don't allow the connection connectors when we have multiple outcomes selected
  // as it doesn't blend well with the user interface, or make sense at that point
  else if (hoveredOutcomeAddress && selectedOutcomes.length <= 1) {
    connectorAddresses = [hoveredOutcomeAddress]
  }

  return {
    activeProject,
    projectTags,
    translate,
    zoomLevel: scale,
    coordinates,
    connections: Object.values(connections), // convert from object to array
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
