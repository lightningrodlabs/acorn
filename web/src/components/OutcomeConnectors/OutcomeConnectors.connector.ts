import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  OutcomeConnectorFromPayload,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
} from '../../redux/ephemeral/outcome-connector/actions'
import OutcomeConnectors, {
  OutcomeConnectorsStateProps,
} from './OutcomeConnectors.component'
import { ActionHashB64 } from '../../types/shared'
import { SmartOutcomeConnectorDispatchProps } from '../SmartOutcomeConnector/SmartOutcomeConnector'

function mapStateToProps(state: RootState): OutcomeConnectorsStateProps {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
      layout: { coordinates, dimensions },
      hover: { hoveredOutcome: hoveredOutcomeAddress },
      outcomeConnector: {
        maybeLinkedOutcome: outcomeConnectorMaybeLinkedOutcome,
        toAddress,
        validToAddresses,
        existingParentConnectionAddress,
      },
      selection: { selectedOutcomes },
    },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const outcomes = state.projects.outcomes[activeProject] || {}
  const collapsedOutcomes =
    state.ui.collapsedOutcomes.collapsedOutcomes[activeProject] || {}

  // visibleOutcomesAddresses are the addresses of the Outcomes
  // whose Connection Connectors should (maybe) be shown for
  let visibleOutcomesAddresses: ActionHashB64[] = []

  // true if we are utilizing the Connection Connector already right now
  if (outcomeConnectorMaybeLinkedOutcome) {
    // connector addresses includes the Outcome we are connecting from
    // to all the possible Outcomes we can connect to validly
    visibleOutcomesAddresses = [
      outcomeConnectorMaybeLinkedOutcome.outcomeActionHash,
      ...validToAddresses,
    ]
      // keeping out any connections that are already in place
      .filter((address) => {
        return !Object.values(connections).find((connection) => {
          return (
            connection.childActionHash ===
              outcomeConnectorMaybeLinkedOutcome.outcomeActionHash &&
            connection.parentActionHash === address
          )
        })
      })
  }
  // show the Connection Connectors for an Outcome which is being hovered over
  else if (hoveredOutcomeAddress && selectedOutcomes.length <= 1) {
    // don't allow the connection connectors when we have multiple Outcomes selected
    // as it doesn't blend well with the user interface, or make sense at that point
    visibleOutcomesAddresses = [hoveredOutcomeAddress]
  }

  return {
    allOutcomeActionHashes: Object.keys(outcomes),
    connections: Object.values(connections),
    activeProject,
    translate,
    zoomLevel: scale,
    coordinates,
    dimensions,
    outcomeConnectorMaybeLinkedOutcome,
    existingParentConnectionAddress,
    toAddress,
    visibleOutcomesAddresses,
    collapsedOutcomes,
  }
}

function mapDispatchToProps(dispatch: any): SmartOutcomeConnectorDispatchProps {
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
