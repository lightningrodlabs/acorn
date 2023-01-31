import { CHANGE_DEPTH_PERCEPTION } from './actions'
import { DepthPerceptionState } from './state-type'

const defaultState: DepthPerceptionState = {
  value: 1,
}

export default function (
  state = defaultState,
  action: any
): DepthPerceptionState {
  const { payload, type } = action
  switch (type) {
    case CHANGE_DEPTH_PERCEPTION:
      return {
        ...state,
        value: payload >= 0 ? payload : 0, // can't be less than 0
      }
    default:
      return state
  }
}
