
import _ from 'lodash'

import { whoami, createWhoami, updateWhoami } from './actions'

const defaultState = null

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case whoami.success().type:
    case createWhoami.success().type:
    case updateWhoami.success().type:
      return payload
    default:
      return state
  }
}

export function hasFetchedForWhoami(state = false, action) {
  const { type } = action
  switch (type) {
    case whoami.success().type:
      return true
    default:
      return state
  }
}
