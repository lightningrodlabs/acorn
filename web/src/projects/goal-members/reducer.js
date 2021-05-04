
import _ from 'lodash'

import {
  createGoalMember,
  fetchGoalMembers,
  updateGoalMember,
  archiveGoalMember,
} from './actions'
import { archiveGoalFully } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  if (
    isCrud(
      action,
      createGoalMember,
      fetchGoalMembers,
      updateGoalMember,
      archiveGoalMember
    )
  ) {
    return crudReducer(
      state,
      action,
      createGoalMember,
      fetchGoalMembers,
      updateGoalMember,
      archiveGoalMember
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // ARCHIVE_GOAL
    case archiveGoalFully.success().type:
      // filter out the GoalMembers whose addresses are listed as having been
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
