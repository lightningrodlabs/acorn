import _ from 'lodash'
import { WireRecord } from '../../../../api/hdkCrud'
import { ProjectMeta } from '../../../../types'
import { Action, CellIdString, WithActionHash } from '../../../../types/shared'
import {
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  UPDATE_PROJECT_META 
} from './actions'

export type ProjectMetaState = {
  [cellId: CellIdString]: WithActionHash<ProjectMeta>
}
const defaultState: ProjectMetaState = {}

export default function (state: ProjectMetaState = defaultState, action: Action<WireRecord<ProjectMeta>>): ProjectMetaState {
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
    default:
      return state
  }
}
