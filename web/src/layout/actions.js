const UPDATE_LAYOUT = 'update_layout'

function updateLayout(payload) {
  return {
    type: UPDATE_LAYOUT,
    payload
  }
}

export {
  UPDATE_LAYOUT,
  updateLayout,
}
