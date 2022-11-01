import _ from 'lodash'

import {
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION,
} from './actions'
import { CREATE_OUTCOME_WITH_CONNECTION, DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { CellIdString, WithActionHash } from '../../../../types/shared'
import { Connection, CreateOutcomeWithConnectionOutput, DeleteOutcomeFullyResponse } from '../../../../types'

export type ProjectConnectionsState = {
  [actionHash: string]: WithActionHash<Connection>
}

export type ConnectionsState = { 
  [cellId: CellIdString]: ProjectConnectionsState
}
const defaultState: ConnectionsState = {}

export default function (state: ConnectionsState = defaultState, action): ConnectionsState {
  // start out by checking whether this a standard CRUD operation
  if (isCrud(action, CREATE_CONNECTION, FETCH_CONNECTIONS, UPDATE_CONNECTION, DELETE_CONNECTION)) {
    return crudReducer<Connection>(
      state,
      action,
      CREATE_CONNECTION,
      FETCH_CONNECTIONS,
      UPDATE_CONNECTION,
      DELETE_CONNECTION
    )
  }

  const { payload, type } = action
  let cellId

  // handle additional cases
  switch (type) {
    // CREATE OUTCOME WITH CONNECTION
    case CREATE_OUTCOME_WITH_CONNECTION:
      const createOutcomeWithConnection = payload as CreateOutcomeWithConnectionOutput
      cellId = action.meta.cellIdString
      if (createOutcomeWithConnection.maybeConnection) {
        return {
          ...state,
          [cellId]: {
            ...state[cellId],
            [createOutcomeWithConnection.maybeConnection.actionHash]: {
              ...createOutcomeWithConnection.maybeConnection.entry,
              actionHash: createOutcomeWithConnection.maybeConnection.actionHash,
            },
          },
        }
      } else {
        return state
      }
    // DELETE OUTCOME
    case DELETE_OUTCOME_FULLY:
      cellId = action.meta.cellIdString
      // filter out the Connections whose actionHashes are listed as having been
      // deleted on account of having deleted one of the Outcomes it links
      const deleteOutcomeFullyResponse = payload as DeleteOutcomeFullyResponse
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => deleteOutcomeFullyResponse.deletedConnections.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
