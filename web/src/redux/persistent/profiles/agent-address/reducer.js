
import _ from 'lodash'

import { FETCH_AGENT_ADDRESS } from './actions'

const defaultState = ''

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case FETCH_AGENT_ADDRESS:
      return payload
    default:
      return state
  }
}
