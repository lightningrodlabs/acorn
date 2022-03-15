
import _ from 'lodash'

import {
  CREATE_OUTCOME_MEMBER,
  FETCH_OUTCOME_MEMBERS,
  UPDATE_OUTCOME_MEMBER,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { DELETE_OUTCOME_COMMENT } from '../goal-comments/actions'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
      DELETE_OUTCOME_COMMENT
    )
  ) {
    return crudReducer(
      state,
      action,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
      DELETE_OUTCOME_COMMENT
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // ARCHIVE_GOAL
    case DELETE_OUTCOME_FULLY:
      // filter out the GoalMembers whose headerHashes are listed as having been
      // archived on account of having archived the Goal it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.archived_goal_members.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
