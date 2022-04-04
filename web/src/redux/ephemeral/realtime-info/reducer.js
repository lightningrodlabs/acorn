import { REMOVE_PEER_STATE, UPDATE_PEER_STATE } from './actions'
// const defaultState = {
//   isOpen: false,
//   outcomeHeaderHash: null,
// }
const defaultState = {}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case UPDATE_PEER_STATE:
      return {
        ...state,
        [payload.agentPubKey]: payload
      }
    case REMOVE_PEER_STATE:
      let newState = { ...state }
      delete newState[payload]
      return newState
    default:
      return state
  }
}
