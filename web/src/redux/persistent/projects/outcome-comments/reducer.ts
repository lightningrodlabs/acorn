import _ from 'lodash'
import { z } from 'zod'

import {
  CREATE_OUTCOME_COMMENT,
  FETCH_OUTCOME_COMMENTS,
  UPDATE_OUTCOME_COMMENT,
  DELETE_OUTCOME_COMMENT,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import {
  Action,
  CellIdString,
  ActionHashB64,
  WithActionHash,
} from '../../../../types/shared'
import { WireRecord } from '../../../../api/hdkCrud'
import {
  DeleteOutcomeFullyResponse,
  OutcomeComment,
  OutcomeCommentSchema,
} from '../../../../types'

export const ProjectOutcomeCommentsStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(OutcomeCommentSchema)
)
export type ProjectOutcomeCommentsState = {
  [actionHash: ActionHashB64]: WithActionHash<OutcomeComment>
}

export type OutcomeCommentsState = {
  [cellId: CellIdString]: ProjectOutcomeCommentsState
}
const defaultState: OutcomeCommentsState = {}

export default function (
  state: OutcomeCommentsState = defaultState,
  action:
    | Action<WireRecord<OutcomeComment>>
    | Action<DeleteOutcomeFullyResponse>
): OutcomeCommentsState {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT
    )
  ) {
    const crudAction = action as Action<WireRecord<OutcomeComment>>
    return crudReducer(
      state,
      crudAction,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // DELETE_OUTCOME
    case DELETE_OUTCOME_FULLY:
      // filter out the OutcomeComments whose actionHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      const deleteFullyResponse = payload as DeleteOutcomeFullyResponse
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) =>
            deleteFullyResponse.deletedOutcomeComments.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
