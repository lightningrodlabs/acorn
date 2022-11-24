import { UPDATE_LAYOUT } from '../layout/actions'
import {
  RESET_TRANSLATE_AND_SCALE,
  CHANGE_TRANSLATE,
  CHANGE_SCALE,
  CHANGE_ALL_DIRECT,
} from './actions'
import { ViewportState } from './state-type'

const defaultState: ViewportState = {
  translate: {
    x: 0,
    y: 0,
  },
  scale: 0.5, // default zoom level
}

const LOWEST_ZOOM_THRESHOLD = 0.1
const HIGHEST_ZOOM_THRESHOLD = 2.5

export default function (state = defaultState, action: any): ViewportState {
  const { payload, type } = action
  switch (type) {
    case CHANGE_TRANSLATE:
      return {
        ...state,
        translate: {
          x: state.translate.x + payload.x,
          y: state.translate.y + payload.y,
        },
      }
    case UPDATE_LAYOUT:
      if (payload.newTranslate) {
        return {
          ...state,
          translate: payload.newTranslate,
        }
      } else {
        return state
      }
    case CHANGE_ALL_DIRECT:
      return payload
    case CHANGE_SCALE:
      const { zoom, pageCoord } = payload
      if (
        state.scale * zoom < LOWEST_ZOOM_THRESHOLD ||
        state.scale * zoom > HIGHEST_ZOOM_THRESHOLD
      ) {
        return state
      }
      // https://stackoverflow.com/a/20821545/2132755 helped
      return {
        ...state,
        scale: state.scale * zoom,
        translate: {
          x: pageCoord.x - (pageCoord.x - state.translate.x) * zoom,
          y: pageCoord.y - (pageCoord.y - state.translate.y) * zoom,
        },
      }
    case RESET_TRANSLATE_AND_SCALE:
      return defaultState
    default:
      return state
  }
}
