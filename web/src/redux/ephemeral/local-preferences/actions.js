const SET_NAVIGATION_PREFERENCE = 'set_navigation_preference'

function setNavigationPreference (preference) {
  return {
    type: SET_NAVIGATION_PREFERENCE,
    payload: preference
  }
}

export {
  SET_NAVIGATION_PREFERENCE,
  setNavigationPreference,
}

const SET_COLOR_PREFERENCE = 'set_color_preference'

function setColorPreference (preference) {
  return {
    type: SET_COLOR_PREFERENCE,
    payload: preference
  }
}

export {
  SET_COLOR_PREFERENCE,
  setColorPreference,
}
