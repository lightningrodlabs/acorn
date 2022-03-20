import _ from 'lodash'

import { FETCH_OUTCOME_HISTORY } from './actions'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // HISTORY_OF_OUTCOME
    case FETCH_OUTCOME_HISTORY:
      return {
        ...state,
        [cellId]: {
          ...state[cellId],
          [payload.headerHash]: payload,
        },
      }
    // DEFAULT
    default:
      return state
  }
}
