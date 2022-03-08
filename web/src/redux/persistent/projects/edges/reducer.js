import _ from 'lodash'

import {
  PREVIEW_EDGES,
  CLEAR_EDGES_PREVIEW,
  createEdge,
  fetchEdges,
  updateEdge,
  archiveEdge,
} from './actions'
import { createGoalWithEdge, archiveGoalFully } from '../goals/actions'
import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

const PREVIEW_KEY_STRING = 'preview'

export default function (state = defaultState, action) {
  // start out by checking whether this a standard CRUD operation
  if (isCrud(action, createEdge, fetchEdges, updateEdge, archiveEdge)) {
    return crudReducer(
      state,
      action,
      createEdge,
      fetchEdges,
      updateEdge,
      archiveEdge
    )
  }

  const { payload, type } = action
  let cellId

  // handle additional cases
  switch (type) {
    case PREVIEW_EDGES:
      cellId = payload.cellId
      const previews = {}
      payload.edges.forEach(edge => {
        const rand = Math.random()
        previews[`${PREVIEW_KEY_STRING}${rand}`] = edge
      })
      return {
        ...state,
        [cellId]: {
          ...state[cellId],
          ...previews,
        },
      }
    case CLEAR_EDGES_PREVIEW:
      cellId = payload.cellId
      return {
        ...state,
        [cellId]: _.pickBy(
          state[cellId],
          (value, key) => !key.startsWith(PREVIEW_KEY_STRING)
        ),
      }
    // CREATE GOAL WITH EDGE
    case createGoalWithEdge.success().type:
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
    case archiveGoalFully.success().type:
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
