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

const defaultState = {}

const PREVIEW_KEY_STRING = 'preview'

export default function (state = defaultState, action) {
  // start out by checking whether this a standard CRUD operation
  if (isCrud(action, CREATE_CONNECTION, FETCH_CONNECTIONS, UPDATE_CONNECTION, DELETE_CONNECTION)) {
    return crudReducer(
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
      payload.connections.forEach(connection => {
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
      cellId = payload.cellId
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (value, key) => !key.startsWith(PREVIEW_KEY_STRING)
        ),
      }
    // CREATE OUTCOME WITH CONNECTION
    case CREATE_OUTCOME_WITH_CONNECTION:
      cellId = action.meta.cellIdString
      if (payload.maybeConnection) {
        return {
          ...state,
          [cellId]: {
            ...state[cellId],
            [payload.maybeConnection.headerHash]: {
              ...payload.maybeConnection.entry,
              headerHash: payload.maybeConnection.headerHash,
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
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.deletedConnections.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
