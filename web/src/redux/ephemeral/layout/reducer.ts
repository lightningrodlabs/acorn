import {
  UPDATE_LAYOUT,
  UPDATE_OUTCOME_COORDINATES,
  UPDATE_OUTCOME_DIMENSIONS,
} from './actions'
import { LayoutState } from './state-type'

const defaultState: LayoutState = {
  coordinates: {},
  dimensions: {},
}

export default function (state = defaultState, action: any): LayoutState {
  const { payload, type } = action
  switch (type) {
    case UPDATE_OUTCOME_COORDINATES:
      return {
        coordinates: payload.coordinates,
        dimensions: {
          ...state.dimensions,
        },
      }
    case UPDATE_OUTCOME_DIMENSIONS:
      return {
        coordinates: {
          ...state.coordinates,
        },
        dimensions: payload.dimensions,
      }
    case UPDATE_LAYOUT:
      return payload.layout
    default:
      return state
  }
}
