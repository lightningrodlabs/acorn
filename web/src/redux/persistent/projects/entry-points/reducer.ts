
import _ from 'lodash'

import {
  FETCH_ENTRY_POINT_DETAILS,
  CREATE_ENTRY_POINT,
  FETCH_ENTRY_POINTS,
  UPDATE_ENTRY_POINT,
  DELETE_ENTRY_POINT,
  EntryPointsAction,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { Action, CellIdString, HeaderHashB64, WithHeaderHash } from '../../../../types/shared'
import { DeleteOutcomeFullyResponse, EntryPoint, EntryPointDetails } from '../../../../types'
import { WireElement } from '../../../../api/hdkCrud'

// state is at the highest level an object with cellIds
// which are like Projects... EntryPoints exist within Projects
// so they are contained per project in the top level state
export type ProjectEntryPointsState = {
  [headerHash: HeaderHashB64]: WithHeaderHash<EntryPoint>
}

// state is an object where the keys are the entry headerHashes of "EntryPoints"
// and the values are modified versions of the EntryPoint data structures that
// also contain their headerHash on those objects
type EntryPointsState = {
  [cellId: CellIdString]: ProjectEntryPointsState
}
const defaultState: EntryPointsState = {}

export default function (state: EntryPointsState = defaultState, action: EntryPointsAction | Action<DeleteOutcomeFullyResponse>): EntryPointsState {
  if (
    isCrud(
      action,
      CREATE_ENTRY_POINT,
      FETCH_ENTRY_POINTS,
      UPDATE_ENTRY_POINT,
      DELETE_ENTRY_POINT
    )
  ) {
    const crudAction = action as Action<WireElement<EntryPoint>>
    return crudReducer(
      state,
      crudAction,
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
      const entryPointDetails = payload as EntryPointDetails
      const mapped = entryPointDetails.entryPoints.map(r => {
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
      const deleteOutcomeResponse = payload as DeleteOutcomeFullyResponse
      // filter out the entry points whose headerHashes are listed as having been
      // deleted on account of having deleted its associated Outcome
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (_value, key) => deleteOutcomeResponse.deletedEntryPoints.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
