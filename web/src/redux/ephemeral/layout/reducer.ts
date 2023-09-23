import {
  UPDATE_LAYOUT,
  UPDATE_OUTCOME_COORDINATES,
  UPDATE_OUTCOME_DIMENSIONS,
} from './actions'
import { CoordinatesState, DimensionsState, LayoutState } from './state-type'

const defaultState: LayoutState = {
  coordinates: {},
  dimensions: {},
}

export default function (state = defaultState, action: any): LayoutState {
  const { payload, type } = action
  switch (type) {
    case UPDATE_OUTCOME_COORDINATES:
      return {
        ...state,
        coordinates: payload.coordinates as CoordinatesState,
      }
    case UPDATE_OUTCOME_DIMENSIONS:
      return {
        ...state,
        dimensions: payload.dimensions as DimensionsState,
      }
    case UPDATE_LAYOUT:
      return payload.layout as LayoutState
    default:
      return state
  }
}
