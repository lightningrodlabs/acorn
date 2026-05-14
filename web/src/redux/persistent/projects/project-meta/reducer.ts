import _ from 'lodash'
import { ProjectMeta } from '../../../../types'
import { CellIdString, WithActionHash } from '../../../../types/shared'
import {
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  UPDATE_PROJECT_META,
} from './actions'
import { REMOVE_PROJECT_CELL_ID } from '../../cells/actions'

export type ProjectMetaState = {
  [cellId: CellIdString]: WithActionHash<ProjectMeta>
}
const defaultState: ProjectMetaState = {}

export default function (
  state: ProjectMetaState = defaultState,
  action: any
): ProjectMetaState {
  const { payload, type } = action
  switch (type) {
    case FETCH_PROJECT_META: {
      const cellIdString = action.meta.cellIdString
      const incoming = {
        ...payload.entry,
        actionHash: payload.actionHash,
      }
      // The dashboard polls FETCH_PROJECT_META every 5s per project. Preserve
      // the existing reference when nothing changed so downstream useEffect
      // deps (e.g. assetStore subscriptions) don't churn.
      if (state[cellIdString] && _.isEqual(state[cellIdString], incoming)) {
        return state
      }
      return {
        ...state,
        [cellIdString]: incoming,
      }
    }
    case SIMPLE_CREATE_PROJECT_META:
    case UPDATE_PROJECT_META:
      return {
        ...state,
        [action.meta.cellIdString]: {
          ...payload.entry,
          actionHash: payload.actionHash,
        },
      }
    case REMOVE_PROJECT_CELL_ID:
      const { [payload as string]: oneToDelete, ...rest } = state
      return rest
    default:
      return state
  }
}
