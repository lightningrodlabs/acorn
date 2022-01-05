
import _ from 'lodash'

import { sendEditSignal } from './actions'

const defaultState = ''

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case sendEditSignal.success().type:
      return payload
    default:
      return state
  }
}