import { CoordinatesState, DimensionsState, LayoutState } from './state-type'

const TRIGGER_UPDATE_LAYOUT = 'trigger_update_layout'
const UPDATE_LAYOUT = 'update_layout'
const UPDATE_OUTCOME_COORDINATES = 'update_outcome_coordinates'
const UPDATE_OUTCOME_DIMENSIONS = 'update_outcome_dimensions'

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

function updateOutcomeCoordinates(
  coordinates: CoordinatesState,
  newTranslate?: { x: number; y: number }
) {
  return {
    type: UPDATE_OUTCOME_COORDINATES,
    payload: {
      coordinates,
      newTranslate,
    },
  }
}

function updateLayout(
  layout: LayoutState,
  newTranslate?: { x: number; y: number }
) {
  return {
    type: UPDATE_LAYOUT,
    payload: {
      layout,
      newTranslate,
    },
  }
}

function updateOutcomeDimensions(dimensions: DimensionsState) {
  return {
    type: UPDATE_OUTCOME_DIMENSIONS,
    payload: {
      dimensions,
    },
  }
}

export {
  TRIGGER_UPDATE_LAYOUT,
  UPDATE_LAYOUT,
  UPDATE_OUTCOME_COORDINATES,
  UPDATE_OUTCOME_DIMENSIONS,
  updateOutcomeCoordinates,
  updateOutcomeDimensions,
  updateLayout,
  triggerUpdateLayout,
}
