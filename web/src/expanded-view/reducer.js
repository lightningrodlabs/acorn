import { OPEN_EXPANDED_VIEW, CLOSE_EXPANDED_VIEW } from './actions'

const defaultState = {
  isOpen: false,
  goalAddress: null,
}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case OPEN_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: true,
        goalAddress: payload.goalAddress,
      }
    case CLOSE_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: false,
        goalAddress: null,
      }
    default:
      return state
  }
}
