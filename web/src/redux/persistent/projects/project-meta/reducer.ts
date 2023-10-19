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
    case SIMPLE_CREATE_PROJECT_META:
    case FETCH_PROJECT_META:
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
