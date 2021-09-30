
import _ from 'lodash'

import { SET_AGENT, fetchAgents, createImportedProfile } from './actions'
import {
  createWhoami,
  updateWhoami,
} from '../who-am-i/actions'

const defaultState = {}

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case fetchAgents.success().type:
      return _.keyBy(payload, 'headerHash')
    case SET_AGENT:
      return {
        ...state,
        [payload.entry.headerHash]: payload.entry,
      }
    case createImportedProfile.success().type:
    case createWhoami.success().type:
    case updateWhoami.success().type:
      return {
        ...state,
        [payload.entry.headerHash]: payload.entry,
      }
    default:
      return state
  }
}
