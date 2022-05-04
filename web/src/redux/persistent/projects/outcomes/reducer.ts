import _ from 'lodash'

import {
  CREATE_OUTCOME,
  FETCH_OUTCOMES,
  UPDATE_OUTCOME,
  DELETE_OUTCOME,
  CREATE_OUTCOME_WITH_CONNECTION,
  DELETE_OUTCOME_FULLY,
  OutcomesAction,
} from './actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { FETCH_ENTRY_POINT_DETAILS } from '../entry-points/actions'
import { Action, CellIdString, HeaderHashB64, Option, WithHeaderHash } from '../../../../types/shared'
import { CreateOutcomeWithConnectionOutput, DeleteOutcomeFullyResponse, EntryPointDetails, Outcome, Scope, TimeFrame } from '../../../../types'
import { WireElement } from '../../../../api/hdkCrud'

export type ProjectOutcomesState = {
  [headerHash: HeaderHashB64]: WithHeaderHash<Outcome>
}
export type OutcomesState = {
  [cellId: CellIdString]: ProjectOutcomesState
}
const defaultState: OutcomesState = {}

export default function (state: OutcomesState = defaultState, action: OutcomesAction | Action<EntryPointDetails> | Action<DeleteOutcomeFullyResponse>): OutcomesState {
  if (isCrud(action, CREATE_OUTCOME, FETCH_OUTCOMES, UPDATE_OUTCOME, DELETE_OUTCOME)) {
    const crudAction = action as Action<WireElement<Outcome>>
    return crudReducer(
      state,
      crudAction,
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
      const outcomeWithConnection = payload as CreateOutcomeWithConnectionOutput
      cellIdString = action.meta.cellIdString
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [outcomeWithConnection.outcome.headerHash]: {
            ...outcomeWithConnection.outcome.entry,
            headerHash: outcomeWithConnection.outcome.headerHash,
          },
        },
      }
    case FETCH_ENTRY_POINT_DETAILS:
      cellIdString = action.meta.cellIdString
      const entryPointDetails = payload as EntryPointDetails
      const mapped = entryPointDetails.outcomes.map((r) => {
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
      const deleteFullyResponse = payload as DeleteOutcomeFullyResponse
      return {
        ...state,
        [cellIdString]: _.pickBy(
          state[cellIdString],
          (_value, key) => key !== deleteFullyResponse.address
        ),
      }
    default:
      return state
  }
}
