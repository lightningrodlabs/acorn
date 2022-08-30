import { UPDATE_LAYOUT } from './actions'
import { LayoutState } from './state-type'

const defaultState: LayoutState = {}

export default function (
  state: LayoutState = defaultState,
  action: any
): LayoutState {
  const { payload, type } = action
  switch (type) {
    case UPDATE_LAYOUT:
      return payload
    default:
      return state
  }
}
