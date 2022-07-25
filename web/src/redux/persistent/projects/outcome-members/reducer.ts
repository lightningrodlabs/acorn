import _ from 'lodash'

import {
  CREATE_OUTCOME_MEMBER,
  FETCH_OUTCOME_MEMBERS,
  UPDATE_OUTCOME_MEMBER,
  DELETE_OUTCOME_MEMBER,
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
import { DeleteOutcomeFullyResponse, OutcomeMember } from '../../../../types'

export type ProjectOutcomeMembersState = {
  [actionHash: ActionHashB64]: WithActionHash<OutcomeMember>
}

export type OutcomeMembersState = {
  [cellId: CellIdString]: ProjectOutcomeMembersState
}
const defaultState: OutcomeMembersState = {}

export default function (
  state: OutcomeMembersState = defaultState,
  action:
    | Action<WireRecord<OutcomeMember>>
    | Action<DeleteOutcomeFullyResponse>
): OutcomeMembersState {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
      DELETE_OUTCOME_MEMBER
    )
  ) {
    const crudAction = action as Action<WireRecord<OutcomeMember>>
    return crudReducer(
      state,
      crudAction,
      CREATE_OUTCOME_MEMBER,
      FETCH_OUTCOME_MEMBERS,
      UPDATE_OUTCOME_MEMBER,
      DELETE_OUTCOME_MEMBER
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
      // filter out the OutcomeMembers whose actionHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) =>
            deleteFullyResponse.deletedOutcomeMembers.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
