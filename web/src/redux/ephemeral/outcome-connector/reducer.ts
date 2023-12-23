import { LinkedOutcomeDetails } from '../../../types'
import { ActionHashB64, Option } from '../../../types/shared'
import {
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
  NEAR_EDGE_PANNING,
  OutcomeConnectorFromPayload,
} from './actions'

export type ConnectionConnectorState = {
  // the Outcome being linked from, the "source"
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  // Outcomes that it is valid for the "source" Outcome to be linked to
  validToAddresses: ActionHashB64[]
  // the Outcome to be linked to, if the user completes
  // the action, the "target"
  toAddress: ActionHashB64
  // existingParentConnectionAddress is the actionHash of the Connection that
  // we would delete, if any, while creating the new one
  existingParentConnectionAddress: ActionHashB64
  nearEdgePanning: number | undefined
}

const defaultState: ConnectionConnectorState = {
  maybeLinkedOutcome: null,
  validToAddresses: [],
  toAddress: null,
  existingParentConnectionAddress: null,
  nearEdgePanning: undefined
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
    case NEAR_EDGE_PANNING:
      return {
        ...state,
        nearEdgePanning: payload as number | undefined
      }
    case RESET_CONNECTION_CONNECTOR:
      return defaultState
    default:
      return state
  }
}
