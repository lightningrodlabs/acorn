import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
} from '../../redux/ephemeral/outcome-connector/actions'
import OutcomeConnectors from './OutcomeConnectors.component'
import { ActionHashB64 } from '../../types/shared'

function mapStateToProps(state: RootState) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
      layout: { coordinates, dimensions },
      hover: { hoveredOutcome: hoveredOutcomeAddress },
      outcomeConnector: {
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
  const collapsedOutcomes =
    state.ui.collapsedOutcomes.collapsedOutcomes[activeProject] || {}
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
    dimensions,
    connections: Object.values(connections), // convert from object to array
    fromAddress,
    relation,
    toAddress,
    existingParentConnectionAddress,
    connectorAddresses,
    collapsedOutcomes,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setOutcomeConnectorFrom: (
      address,
      relation,
      validToAddresses,
      existingParentConnectionAddress
    ) => {
      return dispatch(
        setOutcomeConnectorFrom(
          address,
          relation,
          validToAddresses,
          existingParentConnectionAddress
        )
      )
    },
    setOutcomeConnectorTo: (address) => {
      return dispatch(setOutcomeConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OutcomeConnectors)
