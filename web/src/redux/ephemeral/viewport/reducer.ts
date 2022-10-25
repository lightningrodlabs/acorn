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
  scale: 1,
}

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
    case CHANGE_ALL_DIRECT:
      return payload
    case CHANGE_SCALE:
      const { zoom, mouseX, mouseY } = payload
      if (state.scale * zoom < 0.1 || state.scale * zoom > 2.5) {
        return state
      }
      // https://stackoverflow.com/a/20821545/2132755 helped
      return {
        ...state,
        scale: state.scale * zoom,
        translate: {
          x: mouseX - (mouseX - state.translate.x) * zoom,
          y: mouseY - (mouseY - state.translate.y) * zoom,
        },
      }
    case RESET_TRANSLATE_AND_SCALE:
      return defaultState
    default:
      return state
  }
}
