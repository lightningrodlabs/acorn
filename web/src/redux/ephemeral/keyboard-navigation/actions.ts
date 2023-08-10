/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

const SET_USE_MODAL_NAVIGATION = 'SET_USE_MODAL_NAVIGATION'
const SET_USE_KEYBOARD_NAVIGATION = 'SET_USE_KEYBOARD_NAVIGATION'

/* action creator functions */

const setUseModalNavigation = () => {
  return {
    type: SET_USE_MODAL_NAVIGATION,
  }
}

const setUseKeyboardNavigation = () => {
  return {
    type: SET_USE_KEYBOARD_NAVIGATION,
  }
}

export {
  SET_USE_KEYBOARD_NAVIGATION,
  SET_USE_MODAL_NAVIGATION,
  setUseKeyboardNavigation,
  setUseModalNavigation,
}
