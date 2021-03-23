const SET_NAVIGATION_PREFERENCE = 'set_navigation_preference'

function setNavigationPreference(preference) {
  return {
    type: SET_NAVIGATION_PREFERENCE,
    payload: preference,
  }
}

export { SET_NAVIGATION_PREFERENCE, setNavigationPreference }
