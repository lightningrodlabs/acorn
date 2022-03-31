import _ from 'lodash'
import { WireElement } from '../../../../api/hdkCrud'
import { PriorityMode, ProjectMeta } from '../../../../types'
import { Action, AgentPubKeyB64, CellIdString, HeaderHashB64, Option, WithHeaderHash } from '../../../../types/shared'
import {
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  UPDATE_PROJECT_META 
} from './actions'

type State = {
  [cellId: CellIdString]: WithHeaderHash<ProjectMeta>
}
const defaultState: State = {}

export default function (state: State = defaultState, action: Action<WireElement<ProjectMeta>>) {
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
