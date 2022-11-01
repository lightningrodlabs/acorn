import _ from 'lodash'
import { CellIdString } from '../../../types/shared'

import { SET_ACTIVE_PROJECT } from './actions'

const defaultState: CellIdString = null

export default function (state = defaultState, action: any): CellIdString {
  const { payload, type } = action
  switch (type) {
    case SET_ACTIVE_PROJECT:
      return payload
    default:
      return state
  }
}
