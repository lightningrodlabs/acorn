import _ from 'lodash'
import { SET_ACTIVE_ENTRY_POINTS } from './actions'
import { ActionHashB64 } from '../../../types/shared'

const defaultState: ActionHashB64[] = []

export default function (state = defaultState, action: any): ActionHashB64[] {
  const { payload, type } = action
  switch (type) {
    case SET_ACTIVE_ENTRY_POINTS:
      return payload
    default:
      return state
  }
}
