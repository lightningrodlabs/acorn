import {
  UPDATE_LAYOUT
} from './actions'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case UPDATE_LAYOUT:
      return payload
    default:
      return state
  }
}
