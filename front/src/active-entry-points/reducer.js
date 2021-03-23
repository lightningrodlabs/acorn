
import _ from 'lodash'

import { SET_ACTIVE_ENTRY_POINTS } from './actions'

const defaultState = []

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_ACTIVE_ENTRY_POINTS:
      return payload
    default:
      return state
  }
}
