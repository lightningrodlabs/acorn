/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SET_SHIFT_KEYDOWN = 'SET_SHIFT_KEYDOWN'
const UNSET_SHIFT_KEYDOWN = 'UNSET_SHIFT_KEYDOWN'

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

export {
  SET_SHIFT_KEYDOWN,
  UNSET_SHIFT_KEYDOWN,
  setShiftKeyDown,
  unsetShiftKeyDown,
}
