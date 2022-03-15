import _ from 'lodash'

import {
  PREVIEW_CONNECTIONS,
  CLEAR_CONNECTIONS_PREVIEW,
  CREATE_CONNECTION,
  FETCH_CONNECTIONS,
  UPDATE_CONNECTION,
  DELETE_CONNECTION,
} from './actions'
import { CREATE_OUTCOME_WITH_CONNECTION, DELETE_OUTCOME_FULLY } from '../goals/actions'
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
    // CREATE GOAL WITH EDGE
    case CREATE_OUTCOME_WITH_CONNECTION:
      cellId = action.meta.cellIdString
      if (payload.maybe_edge) {
        return {
          ...state,
          [cellId]: {
            ...state[cellId],
            [payload.maybe_edge.headerHash]: {
              ...payload.maybe_edge.entry,
              headerHash: payload.maybe_edge.headerHash,
            },
          },
        }
      } else {
        return state
      }
    // ARCHIVE GOAL
    case DELETE_OUTCOME_FULLY:
      cellId = action.meta.cellIdString
      // filter out the Edges whose headerHashes are listed as having been
      // archived on account of having archived one of the Goals it links
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (_value, key) => payload.archived_edges.indexOf(key) === -1
        ),
      }
    default:
      return state
  }
}
