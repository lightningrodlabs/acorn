import { OPEN_EXPANDED_VIEW, CLOSE_EXPANDED_VIEW } from './actions'

const defaultState = {
  isOpen: false,
  outcomeActionHash: null,
}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case OPEN_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: true,
        outcomeActionHash: payload.outcomeActionHash,
      }
    case CLOSE_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: false,
        outcomeActionHash: null,
      }
    default:
      return state
  }
}
