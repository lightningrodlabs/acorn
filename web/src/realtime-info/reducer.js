import { REMOVE_PEER_STATE, UPDATE_PEER_STATE } from './actions'
// const defaultState = {
//   isOpen: false,
//   goalAddress: null,
// }
const defaultState = {}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case UPDATE_PEER_STATE:
      // find if peer is already in list, if so, update that entry. If not, add entry to list.
      state = state
      state[payload.agentPubKey] = payload
      return state
    case REMOVE_PEER_STATE:
      state = state
      delete state[payload.agentPubKey]
      return state
    default:
      return state
  }
}
