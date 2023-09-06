import _ from 'lodash'
import { z } from 'zod'

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
import {
  Action,
  CellIdString,
  ActionHashB64,
  WithActionHash,
} from '../../../../types/shared'
import {
  CreateOutcomeWithConnectionOutput,
  DeleteOutcomeFullyResponse,
  EntryPointDetails,
  Outcome,
} from '../../../../types'
import { WireRecord } from '../../../../api/hdkCrud'
import { OutcomeSchema } from 'zod-models'

export const ProjectOutcomesStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(OutcomeSchema)
)
export type ProjectOutcomesState = {
  [actionHash: ActionHashB64]: WithActionHash<Outcome>
}
export type OutcomesState = {
  [cellId: CellIdString]: ProjectOutcomesState
}
const defaultState: OutcomesState = {}

export default function (
  state: OutcomesState = defaultState,
  action:
    | OutcomesAction
    | Action<EntryPointDetails>
    | Action<DeleteOutcomeFullyResponse>
): OutcomesState {
  if (
    isCrud(
      action,
      CREATE_OUTCOME,
      FETCH_OUTCOMES,
      UPDATE_OUTCOME,
      DELETE_OUTCOME
    )
  ) {
    const crudAction = action as Action<WireRecord<Outcome>>
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
          [outcomeWithConnection.outcome.actionHash]: {
            ...outcomeWithConnection.outcome.entry,
            actionHash: outcomeWithConnection.outcome.actionHash,
          },
        },
      }
    case FETCH_ENTRY_POINT_DETAILS:
      cellIdString = action.meta.cellIdString
      const entryPointDetails = payload as EntryPointDetails
      const mapped = entryPointDetails.outcomes.map((r) => {
        return {
          ...r.entry,
          actionHash: r.actionHash,
        }
      })
      // mapped is [ { key: val, actionHash: 'QmAsdFg' }, ...]
      const newVals = _.keyBy(mapped, 'actionHash')
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
          (_value, key) => key !== deleteFullyResponse.outcomeActionHash
        ),
      }
    default:
      return state
  }
}
