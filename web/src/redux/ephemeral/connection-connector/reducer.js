import {
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
} from './actions'

const defaultState = {
  fromAddress: null,
  // RELATION_AS_CHILD or RELATION_AS_PARENT
  relation: null,
  validToAddresses: [],
  toAddress: null,
  // existingParentConnectionAddress is the headerHash of the connection that
  // we would delete in order to create a new one
  // ASSUMPTION: one parent
  existingParentConnectionAddress: null
}

export default function reducer(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_CONNECTION_CONNECTOR_FROM:
      return {
        ...state,
        fromAddress: payload.address,
        relation: payload.relation,
        validToAddresses: payload.validToAddresses,
        // ASSUMPTION: one parent
        existingParentConnectionAddress: payload.existingParentConnectionAddress
      }
    case SET_CONNECTION_CONNECTOR_TO:
      return {
        ...state,
        toAddress: payload,
      }
    case RESET_CONNECTION_CONNECTOR:
      return {
        ...defaultState,
      }
    default:
      return state
  }
}
