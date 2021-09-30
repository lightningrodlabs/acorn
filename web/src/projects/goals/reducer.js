import _ from 'lodash'

import {
  createGoal,
  createGoalWithEdge,
  fetchGoals,
  updateGoal,
  archiveGoal,
  archiveGoalFully,
} from './actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { fetchEntryPointDetails } from '../entry-points/actions'

const defaultState = {}

export default function (state = defaultState, action) {
  if (isCrud(action, createGoal, fetchGoals, updateGoal, archiveGoal)) {
    return crudReducer(
      state,
      action,
      createGoal,
      fetchGoals,
      updateGoal,
      archiveGoal
    )
  }

  const { payload, type } = action
  let cellIdString

  switch (type) {
    case createGoalWithEdge.success().type:
      cellIdString = action.meta.cellIdString
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [payload.goal.headerHash]: {
            ...payload.goal.entry,
            headerHash: payload.goal.headerHash,
          },
        },
      }
    case fetchEntryPointDetails.success().type:
      cellIdString = action.meta.cellIdString
      const mapped = payload.goals.map((r) => {
        return {
          ...r.entry,
          headerHash: r.headerHash,
        }
      })
      // mapped is [ { key: val, headerHash: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'headerHash')
      // combines pre-existing values of the object with new values from
      // Holochain fetch
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          ...newVals,
        },
      }
    case archiveGoalFully.success().type:
      cellIdString = action.meta.cellIdString
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (_value, key) => key !== payload.headerHash
        ),
      }
    default:
      return state
  }
}
