import {
  SET_SHIFT_KEYDOWN,
  UNSET_SHIFT_KEYDOWN,
  SET_TEXT_INPUT_FOCUSED,
} from './actions'

const defaultState = {
  shiftKeyDown: false,
  // whether a text field currently owns the keyboard (suppresses tree directives)
  textInputFocused: false,
}

export default function (state = defaultState, action: any) {
  const { type, payload } = action
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
    case SET_TEXT_INPUT_FOCUSED:
      return {
        ...state,
        textInputFocused: payload,
      }
    default:
      return state
  }
}
