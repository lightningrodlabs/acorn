/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SET_G_KEYDOWN = 'SET_G_KEYDOWN'
const UNSET_G_KEYDOWN = 'UNSET_G_KEYDOWN'
const SET_SHIFT_KEYDOWN = 'SET_SHIFT_KEYDOWN'
const UNSET_SHIFT_KEYDOWN = 'UNSET_SHIFT_KEYDOWN'
const SET_CTRL_KEYDOWN = 'SET_CTRL_KEYDOWN'
const UNSET_CTRL_KEYDOWN = 'UNSET_CTRL_KEYDOWN'

/* action creator functions */

function setGKeyDown() {
  return {
    type: SET_G_KEYDOWN,
  }
}

function unsetGKeyDown() {
  return {
    type: UNSET_G_KEYDOWN,
  }
}

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
function setCtrlKeyDown() {
  return {
    type: SET_CTRL_KEYDOWN,
  }
}

function unsetCtrlKeyDown() {
  return {
    type: UNSET_CTRL_KEYDOWN,
  }
}

export {
  SET_G_KEYDOWN,
  UNSET_G_KEYDOWN,
  SET_SHIFT_KEYDOWN,
  UNSET_SHIFT_KEYDOWN,
  SET_CTRL_KEYDOWN,
  UNSET_CTRL_KEYDOWN,
  setCtrlKeyDown,
  unsetCtrlKeyDown,
  setGKeyDown,
  unsetGKeyDown,
  setShiftKeyDown,
  unsetShiftKeyDown,
}
