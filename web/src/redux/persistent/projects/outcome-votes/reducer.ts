import _ from 'lodash'

import {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
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
import { DeleteOutcomeFullyResponse, OutcomeVote } from '../../../../types'

export type ProjectOutcomeVotesState = {
  [actionHash: ActionHashB64]: WithActionHash<OutcomeVote>
}

export type OutcomeVotesState = {
  [cellId: CellIdString]: ProjectOutcomeVotesState
}
const defaultState: OutcomeVotesState = {}

export default function (
  state: OutcomeVotesState = defaultState,
  action: Action<WireRecord<OutcomeVote>> | Action<DeleteOutcomeFullyResponse>
): OutcomeVotesState {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_VOTE,
      FETCH_OUTCOME_VOTES,
      UPDATE_OUTCOME_VOTE,
      DELETE_OUTCOME_VOTE
    )
  ) {
    const crudAction = action as Action<WireRecord<OutcomeVote>>
    return crudReducer(
      state,
      crudAction,
      CREATE_OUTCOME_VOTE,
      FETCH_OUTCOME_VOTES,
      UPDATE_OUTCOME_VOTE,
      DELETE_OUTCOME_VOTE
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // DELETE_OUTCOME
    case DELETE_OUTCOME_FULLY:
      const deleteFullyResponse = payload as DeleteOutcomeFullyResponse
      // filter out the OutcomeVotes whose actionHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) =>
            deleteFullyResponse.deletedOutcomeVotes.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
