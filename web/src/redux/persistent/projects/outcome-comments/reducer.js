import _ from 'lodash'

import {
  CREATE_OUTCOME_COMMENT,
  FETCH_OUTCOME_COMMENTS,
  UPDATE_OUTCOME_COMMENT,
  DELETE_OUTCOME_COMMENT,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  if (
    isCrud(
      action,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT,
    )
  ) {
    return crudReducer(
      state,
      action,
      CREATE_OUTCOME_COMMENT,
      FETCH_OUTCOME_COMMENTS,
      UPDATE_OUTCOME_COMMENT,
      DELETE_OUTCOME_COMMENT,
    )
  }

  let cellId
  if (action.meta && action.meta.cellIdString) {
    cellId = action.meta.cellIdString
  }

  switch (type) {
    // DELETE_OUTCOME
    case DELETE_OUTCOME_FULLY:
      // filter out the OutcomeComments whose headerHashes are listed as having been
      // deleted on account of having deleted the Outcome it relates to
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.deletedOutcomeComments.indexOf(key) === -1
        ),
      }
    // DEFAULT
    default:
      return state
  }
}
