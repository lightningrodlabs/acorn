import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  OutcomeConnectorFromPayload,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
} from '../../redux/ephemeral/outcome-connector/actions'
import OutcomeConnectors, { OutcomeConnectorCommonDispatchProps, OutcomeConnectorsStateProps } from './OutcomeConnectors.component'
import { ActionHashB64 } from '../../types/shared'

function mapStateToProps(state: RootState): OutcomeConnectorsStateProps {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
      layout: { coordinates, dimensions },
      hover: { hoveredOutcome: hoveredOutcomeAddress },
      outcomeConnector: {
        maybeLinkedOutcome,
        toAddress,
        validToAddresses,
        existingParentConnectionAddress,
      },
      selection: { selectedOutcomes },
    },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const collapsedOutcomes =
    state.ui.collapsedOutcomes.collapsedOutcomes[activeProject] || {}
  let connectorAddresses: ActionHashB64[] = []
  // only set validToAddresses if we are actually utilizing the connection connector right now
  if (maybeLinkedOutcome) {
    // connector addresses includes the outcome we are connecting from
    // to all the possible Outcomes we can connect to validly
    connectorAddresses = [
      maybeLinkedOutcome.outcomeActionHash,
      ...validToAddresses,
    ]
  }
  // don't allow the connection connectors when we have multiple Outcomes selected
  // as it doesn't blend well with the user interface, or make sense at that point
  else if (hoveredOutcomeAddress && selectedOutcomes.length <= 1) {
    connectorAddresses = [hoveredOutcomeAddress]
  }

  // remove any connections that are already in place
  connectorAddresses = connectorAddresses.filter((address) => {
    return !Object.values(connections).find((connection) => {
      return (
        connection.childActionHash === maybeLinkedOutcome.outcomeActionHash &&
        connection.parentActionHash === address
      )
    })
  })

  return {
    activeProject,
    translate,
    zoomLevel: scale,
    coordinates,
    dimensions,
    connections: Object.values(connections), // convert from object to array
    maybeLinkedOutcome,
    existingParentConnectionAddress,
    toAddress,
    connectorAddresses,
    collapsedOutcomes,
  }
}

function mapDispatchToProps(dispatch: any): OutcomeConnectorCommonDispatchProps {
  return {
    setOutcomeConnectorFrom: (payload: OutcomeConnectorFromPayload) => {
      return dispatch(setOutcomeConnectorFrom(payload))
    },
    setOutcomeConnectorTo: (address: ActionHashB64) => {
      return dispatch(setOutcomeConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OutcomeConnectors)
