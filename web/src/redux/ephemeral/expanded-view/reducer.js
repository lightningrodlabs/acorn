import { OPEN_EXPANDED_VIEW, CLOSE_EXPANDED_VIEW } from './actions'

const defaultState = {
  isOpen: false,
  outcomeAddress: null,
}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case OPEN_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: true,
        outcomeAddress: payload.outcomeAddress,
      }
    case CLOSE_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: false,
        outcomeAddress: null,
      }
    default:
      return state
  }
}
