
import _ from 'lodash'

import {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { Action, CellIdString, HeaderHashB64, WithHeaderHash } from '../../../../types/shared'
import { WireElement } from '../../../../api/hdkCrud'
import { DeleteOutcomeFullyResponse, OutcomeVote } from '../../../../types'

export type ProjectOutcomeVotesState = {
  [headerHash: HeaderHashB64]: WithHeaderHash<OutcomeVote>
}

export type OutcomeVotesState = {
  [cellId: CellIdString]: ProjectOutcomeVotesState
}
const defaultState: OutcomeVotesState = {}

export default function (state: OutcomeVotesState = defaultState, action: Action<WireElement<OutcomeVote>> | Action<DeleteOutcomeFullyResponse>): OutcomeVotesState {
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
    const crudAction = action as Action<WireElement<OutcomeVote>>
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
      // filter out the OutcomeVotes whose headerHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => deleteFullyResponse.deletedOutcomeVotes.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
