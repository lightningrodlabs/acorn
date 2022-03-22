
import _ from 'lodash'

import { WHOAMI, CREATE_WHOAMI, UPDATE_WHOAMI } from './actions'

const defaultState = null

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case WHOAMI:
    case CREATE_WHOAMI:
    case UPDATE_WHOAMI:
      return payload
    default:
      return state
  }
}

export function hasFetchedForWhoami(state = false, action) {
  const { type } = action
  switch (type) {
    case WHOAMI:
      return true
    default:
      return state
  }
}
