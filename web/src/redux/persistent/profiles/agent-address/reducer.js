
import _ from 'lodash'

import { fetchAgentAddress } from './actions'

const defaultState = ''

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case fetchAgentAddress.success().type:
      return payload
    default:
      return state
  }
}
