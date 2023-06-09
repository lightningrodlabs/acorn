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
