const SET_NAVIGATION_PREFERENCE = 'set_navigation_preference'
const SET_HAS_ACCESSED_GUIDEBOOK = 'set_has_accessed_guidebook'

function setNavigationPreference (preference) {
  return {
    type: SET_NAVIGATION_PREFERENCE,
    payload: preference
  }
}

function setHasAccessedGuidebook (hasAccessedGuidebook) {
  return {
    type: SET_HAS_ACCESSED_GUIDEBOOK,
    payload: hasAccessedGuidebook
  }
}

export {
  SET_NAVIGATION_PREFERENCE,
  SET_HAS_ACCESSED_GUIDEBOOK,
  setNavigationPreference,
  setHasAccessedGuidebook
}
