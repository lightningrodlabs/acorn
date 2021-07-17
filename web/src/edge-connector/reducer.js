import {
  SET_EDGE_CONNECTOR_FROM,
  SET_EDGE_CONNECTOR_TO,
  RESET_EDGE_CONNECTOR,
} from './actions'

const defaultState = {
  fromAddress: null,
  relation: null,
  validToAddresses: [],
  toAddress: null,
  existingParentEdgeAddress: null
}

export default function reducer(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_EDGE_CONNECTOR_FROM:
      return {
        ...state,
        fromAddress: payload.address,
        relation: payload.relation,
        validToAddresses: payload.validToAddresses,
        existingParentEdgeAddress: payload.existingParentEdgeAddress
      }
    case SET_EDGE_CONNECTOR_TO:
      return {
        ...state,
        toAddress: payload,
      }
    case RESET_EDGE_CONNECTOR:
      return {
        ...defaultState,
      }
    default:
      return state
  }
}
