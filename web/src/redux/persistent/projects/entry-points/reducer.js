
import _ from 'lodash'

import {
  FETCH_ENTRY_POINT_DETAILS,
  CREATE_ENTRY_POINT,
  FETCH_ENTRY_POINTS,
  UPDATE_ENTRY_POINT,
  DELETE_ENTRY_POINT,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

// state is at the highest level an object with cellIds
// which are like Projects... EntryPoints exist within Projects
// so they are contained per project in the top level state

// state is an object where the keys are the entry headerHashes of "EntryPoints"
// and the values are modified versions of the EntryPoint data structures that
// also contain their headerHash on those objects
const defaultState = {}

export default function (state = defaultState, action) {
  if (
    isCrud(
      action,
      CREATE_ENTRY_POINT,
      FETCH_ENTRY_POINTS,
      UPDATE_ENTRY_POINT,
      DELETE_ENTRY_POINT
    )
  ) {
    return crudReducer(
      state,
      action,
      CREATE_ENTRY_POINT,
      FETCH_ENTRY_POINTS,
      UPDATE_ENTRY_POINT,
      DELETE_ENTRY_POINT
    )
  }

  const { payload, type } = action
  let cellIdString
  switch (type) {
    case FETCH_ENTRY_POINT_DETAILS:
      cellIdString = action.meta.cellIdString
      const mapped = payload.entry_points.map(r => {
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
      // filter out the entry points whose headerHashes are listed as having been
      // archived on account of having archived its associated Goal
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (_value, key) => payload.archived_entry_points.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
