import { SET_SHIFT_KEYDOWN, UNSET_SHIFT_KEYDOWN } from './actions'

const defaultState = {
  shiftKeyDown: false,
}

export default function (state = defaultState, action: any) {
  const { type } = action
  switch (type) {
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
    default:
      return state
  }
}
