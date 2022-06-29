

import {
  SET_MOUSEDOWN,
  UNSET_MOUSEDOWN,
  SET_LIVE_COORDINATE,
  SET_COORDINATE,
  UNSET_COORDINATE,
  SET_OUTCOMES,
  UNSET_OUTCOMES,
  SET_SIZE,
  UNSET_SIZE,
} from './actions'

const defaultState = {
  mousedown: false,
  // this is whatever current mouse coordinate is
  liveCoordinate: {
    x: 0,
    y: 0,
  },
  // this is the START coordinate for
  // an Outcome selection action
  coordinate: {
    x: 0,
    y: 0,
  },
  size: {
    w: 0,
    h: 0,
  },
  outcomesAddresses: null,
}

export default function (state = defaultState, action) {
  const { coordinate, type, outcomesAddresses, size } = action
  switch (type) {
    case SET_MOUSEDOWN:
      return {
        ...state,
        mousedown: true,
      }
    case UNSET_MOUSEDOWN:
      return {
        ...state,
        mousedown: false,
      }
    case SET_LIVE_COORDINATE:
      return {
        ...state,
        liveCoordinate: coordinate,
      }
    case SET_COORDINATE:
      return {
        ...state,
        coordinate: coordinate,
      }
    case UNSET_COORDINATE:
      return {
        ...state,
        coordinate: { x: 0, y: 0 },
      }
    case SET_OUTCOMES:
      return {
        ...state,
        outcomesAddresses,
      }
    case UNSET_OUTCOMES:
      return {
        ...state,
        outcomesAddresses: null,
      }
    case SET_SIZE:
      return {
        ...state,
        size,
      }
    case UNSET_SIZE:
      return {
        ...state,
        size: { w: 0, h: 0 },
      }
    default:
      return state
  }
}
