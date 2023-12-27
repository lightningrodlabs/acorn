import { LinkedOutcomeDetails } from '../../../types'
import { ActionHashB64, Option } from '../../../types/shared'

const SET_CONNECTION_CONNECTOR_FROM = 'SET_CONNECTION_CONNECTOR_FROM'
const SET_CONNECTION_CONNECTOR_TO = 'SET_CONNECTION_CONNECTOR_TO'
const RESET_CONNECTION_CONNECTOR = 'RESET_CONNECTION_CONNECTOR'
const NEAR_EDGE_PANNING = 'NEAR_EDGE_PANNING'

export type OutcomeConnectorFromPayload = {
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  validToAddresses: ActionHashB64[]
  existingParentConnectionAddress: Option<ActionHashB64>
}

function setOutcomeConnectorFrom(payload: OutcomeConnectorFromPayload) {
  return {
    type: SET_CONNECTION_CONNECTOR_FROM,
    payload,
  }
}

function setOutcomeConnectorTo(actionHash: ActionHashB64) {
  return {
    type: SET_CONNECTION_CONNECTOR_TO,
    payload: actionHash,
  }
}

// payload is a window.setInterval ID
// or else is undefined
function nearEdgePanning(payload?: number) {
  return {
    type: NEAR_EDGE_PANNING,
    payload,
  }
}

function resetOutcomeConnector() {
  return {
    type: RESET_CONNECTION_CONNECTOR,
  }
}

export {
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
  NEAR_EDGE_PANNING,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  resetOutcomeConnector,
  nearEdgePanning,
}
