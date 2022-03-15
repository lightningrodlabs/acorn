import _ from 'lodash'

import {
  CREATE_OUTCOME,
  FETCH_OUTCOMES,
  UPDATE_OUTCOME,
  DELETE_OUTCOME,
  CREATE_OUTCOME_WITH_CONNECTION,
  DELETE_OUTCOME_FULLY,
} from './actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { FETCH_ENTRY_POINT_DETAILS } from '../entry-points/actions'

const defaultState = {}

export default function (state = defaultState, action) {
  if (isCrud(action, CREATE_OUTCOME, FETCH_OUTCOMES, UPDATE_OUTCOME, DELETE_OUTCOME)) {
    return crudReducer(
      state,
      action,
      CREATE_OUTCOME,
      FETCH_OUTCOMES,
      UPDATE_OUTCOME,
      DELETE_OUTCOME
    )
  }

  const { payload, type } = action
  let cellIdString

  switch (type) {
    case CREATE_OUTCOME_WITH_CONNECTION:
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
    case FETCH_ENTRY_POINT_DETAILS:
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
    case DELETE_OUTCOME_FULLY:
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
