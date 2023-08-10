const SET_NAVIGATION_PREFERENCE = 'set_navigation_preference'
const SET_KEYBOARD_NAVIGATION_PREFERENCE = 'set_keyboard_navigation_preference'

function setNavigationPreference(preference) {
  return {
    type: SET_NAVIGATION_PREFERENCE,
    payload: preference,
  }
}

function setKeyboardNavigationPreference(preference) {
  return {
    type: SET_KEYBOARD_NAVIGATION_PREFERENCE,
    payload: preference,
  }
}

export {
  SET_NAVIGATION_PREFERENCE,
  SET_KEYBOARD_NAVIGATION_PREFERENCE,
  setNavigationPreference,
  setKeyboardNavigationPreference,
}
