import { OPEN_EXPANDED_VIEW, CLOSE_EXPANDED_VIEW } from './actions'

const defaultState = {
  isOpen: false,
  outcomeHeaderHash: null,
}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case OPEN_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: true,
        outcomeHeaderHash: payload.outcomeHeaderHash,
      }
    case CLOSE_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: false,
        outcomeHeaderHash: null,
      }
    default:
      return state
  }
}
