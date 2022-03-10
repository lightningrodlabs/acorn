import _ from 'lodash'

import {
  CREATE_OUTCOME_COMMENT,
  FETCH_OUTCOME_COMMENTS,
  UPDATE_OUTCOME_COMMENT,
  DELETE_OUTCOME_COMMENT,
  createGoalComment,
  fetchGoalComments,
  updateGoalComment,
  archiveGoalComment,
} from './actions'
import { archiveGoalFully } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT,
    )
  ) {
    return crudReducer(
      state,
      action,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT,
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // ARCHIVE_GOAL
    case archiveGoalFully.success().type:
      // filter out the GoalComments whose headerHashes are listed as having been
      // archived on account of having archived the Goal it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.archived_goal_comments.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
