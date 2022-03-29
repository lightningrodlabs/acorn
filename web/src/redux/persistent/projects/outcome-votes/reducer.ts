
import _ from 'lodash'

import {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { Action, AgentPubKeyB64, CellIdString, HeaderHashB64 } from '../../../../types/shared'
import { WireElement } from '../../../../api/hdkCrud'
import { DeleteOutcomeFullyResponse, OutcomeVote } from '../../../../types'

type State = {
  [cellId: CellIdString]: {
    [headerHash: HeaderHashB64]: {
      outcomeAddress: HeaderHashB64,
      urgency: number, //f64,
      importance: number, //f64,
      impact: number, //f64,
      effort: number, //f64,
      agentAddress: AgentPubKeyB64,
      unixTimestamp: number, //f64,
      isImported: boolean,
      // additional field
      headerHash: HeaderHashB64
    }
  }
}
const defaultState: State = {}

export default function (state: State = defaultState, action: Action<WireElement<OutcomeVote>> | Action<DeleteOutcomeFullyResponse>): State {
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
