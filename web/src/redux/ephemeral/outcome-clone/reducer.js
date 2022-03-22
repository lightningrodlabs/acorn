import { SET_OUTCOME_CLONE } from './actions'

const defaultState = {
  outcomes: [],
}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_OUTCOME_CLONE:
      return {
        ...state,
        outcomes: payload,
      }
    default:
      return state
  }
}
