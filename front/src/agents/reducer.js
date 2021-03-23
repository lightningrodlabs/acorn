
import _ from 'lodash'

import { SET_AGENT, fetchAgents } from './actions'
import {
  createWhoami,
  updateWhoami,
} from '../who-am-i/actions'

const defaultState = {}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case fetchAgents.success().type:
      console.log('FETCH_AGENTS_SUCCESS', payload)
      return _.keyBy(payload, 'address')
    case SET_AGENT:
      return {
        ...state,
        [payload.entry.address]: payload.entry,
      }
    case createWhoami.success().type:
    case updateWhoami.success().type:
      return {
        ...state,
        [payload.entry.address]: payload.entry,
      }
    default:
      return state
  }
}
