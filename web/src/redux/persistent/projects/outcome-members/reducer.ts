
import _ from 'lodash'

import {
  CREATE_OUTCOME_MEMBER,
  FETCH_OUTCOME_MEMBERS,
  UPDATE_OUTCOME_MEMBER,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { DELETE_OUTCOME_COMMENT } from '../outcome-comments/actions'
import { Action, AgentPubKeyB64, CellIdString, HeaderHashB64 } from '../../../../types/shared'
import { WireElement } from '../../../../api/hdkCrud'
import { DeleteOutcomeFullyResponse, OutcomeMember } from '../../../../types'

type State = {
  [cellId: CellIdString]: {
    [headerHash: HeaderHashB64]: {
      outcomeAddress: HeaderHashB64,
      agentAddress: AgentPubKeyB64,
      userEditHash: AgentPubKeyB64,
      unixTimestamp: number, //f64,
      isImported: boolean,
      // additional field
      headerHash: HeaderHashB64
    }
  }
}
const defaultState: State = {}

export default function (state: State = defaultState, action: Action<WireElement<OutcomeMember>> | Action<DeleteOutcomeFullyResponse>): State {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
      DELETE_OUTCOME_COMMENT
    )
  ) {
    const crudAction = action as Action<WireElement<OutcomeMember>>
    return crudReducer(
      state,
      crudAction,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
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
      const deleteFullyResponse = payload as DeleteOutcomeFullyResponse
      // filter out the OutcomeMembers whose headerHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => deleteFullyResponse.deletedOutcomeMembers.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
