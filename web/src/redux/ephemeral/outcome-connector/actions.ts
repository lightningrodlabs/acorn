import { LinkedOutcomeDetails } from '../../../types'
import { ActionHashB64, Option } from '../../../types/shared'

const SET_CONNECTION_CONNECTOR_FROM = 'SET_CONNECTION_CONNECTOR_FROM'
const SET_CONNECTION_CONNECTOR_TO = 'SET_CONNECTION_CONNECTOR_TO'
const RESET_CONNECTION_CONNECTOR = 'RESET_CONNECTION_CONNECTOR'

export type OutcomeConnectorFromPayload = {
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  validToAddresses: ActionHashB64[]
  existingParentConnectionAddress: ActionHashB64
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

function resetOutcomeConnector() {
  return {
    type: RESET_CONNECTION_CONNECTOR,
  }
}

export {
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
  setOutcomeConnectorFrom,
  setOutcomeConnectorTo,
  resetOutcomeConnector,
}
