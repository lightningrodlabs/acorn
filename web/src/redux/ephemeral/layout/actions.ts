import { LayoutState } from './state-type'

const TRIGGER_UPDATE_LAYOUT = 'trigger_update_layout'
const UPDATE_LAYOUT = 'update_layout'

// this action makes no direct
// difference to the reducer, it just triggers a reflow
// of the layout
function triggerUpdateLayout(instant?: boolean) {
  return {
    type: TRIGGER_UPDATE_LAYOUT,
    payload: {
      instant,
    },
  }
}

function updateLayout(payload: LayoutState) {
  return {
    type: UPDATE_LAYOUT,
    payload,
  }
}

export {
  TRIGGER_UPDATE_LAYOUT,
  UPDATE_LAYOUT,
  updateLayout,
  triggerUpdateLayout,
}
