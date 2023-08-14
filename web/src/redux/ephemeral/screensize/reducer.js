import { SET_SCREEN_DIMENSIONS } from './actions'

const defaultState = {
  width: 0,
  height: 0,
}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_SCREEN_DIMENSIONS:
      return {
        width: payload.width,
        height: payload.height,
      }
    default:
      return state
  }
}
