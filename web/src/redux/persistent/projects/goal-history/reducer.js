import _ from 'lodash'

import { fetchGoalHistory } from './actions'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // HISTORY_OF_GOAL
    case fetchGoalHistory.success().type:
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
