
import _ from 'lodash'

import { SET_ACTIVE_PROJECT } from './actions'

const defaultState = null

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_ACTIVE_PROJECT:
      return payload
    default:
      return state
  }
}
