import { SET_GOAL_CLONE } from './actions'

const defaultState = {
  goals: [],
}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_GOAL_CLONE:
      return {
        ...state,
        goals: payload,
      }
    default:
      return state
  }
}
