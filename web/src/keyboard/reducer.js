

import {
  SET_G_KEYDOWN,
  UNSET_G_KEYDOWN,
  SET_SHIFT_KEYDOWN,
  UNSET_SHIFT_KEYDOWN,
  SET_CTRL_KEYDOWN,
  UNSET_CTRL_KEYDOWN,
} from './actions'

const defaultState = {
  shiftKeyDown: false,
  gKeyDown: false,
  ctrlKeyDown: false,
}

export default function(state = defaultState, action) {
  const { type } = action
  switch (type) {
    case SET_G_KEYDOWN:
      return {
        ...state,
        gKeyDown: true,
      }
    case UNSET_G_KEYDOWN:
      return {
        ...state,
        gKeyDown: false,
      }
    case SET_SHIFT_KEYDOWN:
      return {
        ...state,
        shiftKeyDown: true,
      }
    case UNSET_SHIFT_KEYDOWN:
      return {
        ...state,
        shiftKeyDown: false,
      }
    case SET_CTRL_KEYDOWN:
      return {
        ...state,
        ctrlKeyDown: true,
      }
    case UNSET_CTRL_KEYDOWN:
      return {
        ...state,
        ctrlKeyDown: false,
      }
    default:
      return state
  }
}
