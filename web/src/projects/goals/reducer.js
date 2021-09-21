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
          [payload.goal.address]: {
            ...payload.goal.entry,
            address: payload.goal.address,
          },
        },
      }
    case fetchEntryPointDetails.success().type:
      cellIdString = action.meta.cellIdString
      const mapped = payload.goals.map((r) => {
        return {
          ...r.entry,
          address: r.address,
        }
      })
      // mapped is [ { key: val, address: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'address')
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
          (_value, key) => key !== payload.address
        ),
      }
    default:
      return state
  }
}
