import _ from 'lodash'

import {
  PREVIEW_CONNECTIONS,
  CLEAR_CONNECTIONS_PREVIEW,
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION,
} from './actions'
import { CREATE_OUTCOME_WITH_CONNECTION, DELETE_OUTCOME_FULLY } from '../outcomes/actions'
import { isCrud, crudReducer } from '../../crudRedux'
import { CellIdString, HeaderHashB64 } from '../../../../types/shared'
import { Connection, CreateOutcomeWithConnectionOutput, DeleteOutcomeFullyResponse } from '../../../../types'


type State = { 
  [cellId: CellIdString]: {
    [headerHashOrPreviewId: string]: {
      parentAddress: HeaderHashB64,
      childAddress: HeaderHashB64,
      randomizer: number, //i64,
      isImported: boolean,
      headerHash?: HeaderHashB64 // unable to do spread operation in type definition
    }
  }
}
const defaultState: State = {}
const PREVIEW_KEY_STRING = 'preview'

export default function (state: State = defaultState, action): State {
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
    case PREVIEW_CONNECTIONS:
      cellId = payload.cellId
      const previews = {}
      const connections = payload.connections as Array<Connection>
      connections.forEach(connection => {
        const rand = Math.random()
        previews[`${PREVIEW_KEY_STRING}${rand}`] = connection
      })
      return {
        ...state,
        [cellId]: {
          ...state[cellId],
          ...previews,
        },
      }
    case CLEAR_CONNECTIONS_PREVIEW:
      cellId = payload.cellId as CellIdString
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (value, key) => !key.startsWith(PREVIEW_KEY_STRING)
        ),
      }
    // CREATE OUTCOME WITH CONNECTION
    case CREATE_OUTCOME_WITH_CONNECTION:
      const createOutcomeWithConnection = payload as CreateOutcomeWithConnectionOutput
      cellId = action.meta.cellIdString
      if (createOutcomeWithConnection.maybeConnection) {
        return {
          ...state,
          [cellId]: {
            ...state[cellId],
            [createOutcomeWithConnection.maybeConnection.headerHash]: {
              ...createOutcomeWithConnection.maybeConnection.entry,
              headerHash: createOutcomeWithConnection.maybeConnection.headerHash,
            },
          },
        }
      } else {
        return state
      }
    // DELETE OUTCOME
    case DELETE_OUTCOME_FULLY:
      cellId = action.meta.cellIdString
      // filter out the Connections whose headerHashes are listed as having been
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
