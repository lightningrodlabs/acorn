
import _ from 'lodash'

import {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_VOTE,
      FETCH_OUTCOME_VOTES,
      UPDATE_OUTCOME_VOTE,
      DELETE_OUTCOME_VOTE
    )
  ) {
    return crudReducer(
      state,
      action,
      CREATE_OUTCOME_VOTE,
      FETCH_OUTCOME_VOTES,
      UPDATE_OUTCOME_VOTE,
      DELETE_OUTCOME_VOTE
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // ARCHIVE_GOAL
    case DELETE_OUTCOME_FULLY:
      // filter out the GoalVotes whose headerHashes are listed as having been
      // archived on account of having archived the Goal it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.archived_goal_votes.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
