import _ from 'lodash'
import { WireElement } from '../../../../api/hdkCrud'
import { ProjectMeta } from '../../../../types'
import { Action, CellIdString, WithHeaderHash } from '../../../../types/shared'
import {
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  UPDATE_PROJECT_META 
} from './actions'

export type ProjectMetaState = {
  [cellId: CellIdString]: WithHeaderHash<ProjectMeta>
}
const defaultState: ProjectMetaState = {}

export default function (state: ProjectMetaState = defaultState, action: Action<WireElement<ProjectMeta>>): ProjectMetaState {
  const { payload, type } = action
  switch (type) {
    case SIMPLE_CREATE_PROJECT_META:
    case FETCH_PROJECT_META:
    case UPDATE_PROJECT_META:
      return {
        ...state,
        [action.meta.cellIdString]: {
          ...payload.entry,
          headerHash: payload.headerHash,
        },
      }
    default:
      return state
  }
}
