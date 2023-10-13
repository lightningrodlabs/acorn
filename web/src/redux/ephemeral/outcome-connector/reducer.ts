import { LinkedOutcomeDetails } from '../../../types'
import { ActionHashB64, Option } from '../../../types/shared'
import {
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
  OutcomeConnectorFromPayload,
} from './actions'

export type ConnectionConnectorState = {
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  validToAddresses: ActionHashB64[]
  toAddress: ActionHashB64
  // existingParentConnectionAddress is the actionHash of the Connection that
  // we would delete, if any, while creating the new one
  existingParentConnectionAddress: ActionHashB64
}

const defaultState: ConnectionConnectorState = {
  maybeLinkedOutcome: null,
  validToAddresses: [],
  toAddress: null,
  existingParentConnectionAddress: null
}

export default function reducer(state = defaultState, action: any): ConnectionConnectorState {
  const { payload, type } = action
  switch (type) {
    case SET_CONNECTION_CONNECTOR_FROM:
      return {
        ...state,
        ...payload as OutcomeConnectorFromPayload
      }
    case SET_CONNECTION_CONNECTOR_TO:
      return {
        ...state,
        toAddress: payload as ActionHashB64,
      }
    case RESET_CONNECTION_CONNECTOR:
      return defaultState
    default:
      return state
  }
}
