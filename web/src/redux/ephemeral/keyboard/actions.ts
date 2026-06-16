/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SET_SHIFT_KEYDOWN = 'SET_SHIFT_KEYDOWN'
const UNSET_SHIFT_KEYDOWN = 'UNSET_SHIFT_KEYDOWN'
// True while a text field (e.g. the harness chat) owns the keyboard. Tree
// directives (Enter/arrows/Backspace) are suppressed so typing never opens,
// moves, or deletes nodes.
const SET_TEXT_INPUT_FOCUSED = 'SET_TEXT_INPUT_FOCUSED'

/* action creator functions */

function setShiftKeyDown() {
  return {
    type: SET_SHIFT_KEYDOWN,
  }
}

function unsetShiftKeyDown() {
  return {
    type: UNSET_SHIFT_KEYDOWN,
  }
}

function setTextInputFocused(focused: boolean) {
  return {
    type: SET_TEXT_INPUT_FOCUSED,
    payload: focused,
  }
}

export {
  SET_SHIFT_KEYDOWN,
  UNSET_SHIFT_KEYDOWN,
  SET_TEXT_INPUT_FOCUSED,
  setShiftKeyDown,
  unsetShiftKeyDown,
  setTextInputFocused,
}
