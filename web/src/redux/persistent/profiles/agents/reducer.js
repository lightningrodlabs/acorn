
import _ from 'lodash'

import { SET_AGENT, FETCH_AGENTS, CREATE_IMPORTED_PROFILE } from './actions'
import {
  CREATE_WHOAMI,
  UPDATE_WHOAMI,
} from '../who-am-i/actions'

const defaultState = {}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case FETCH_AGENTS:
      return _.keyBy(payload, 'address')
    case SET_AGENT:
      return {
        ...state,
        [payload.entry.address]: payload.entry,
      }
    case CREATE_IMPORTED_PROFILE:
    case CREATE_WHOAMI:
    case UPDATE_WHOAMI:
      return {
        ...state,
        [payload.entry.address]: payload.entry,
      }
    default:
      return state
  }
}
