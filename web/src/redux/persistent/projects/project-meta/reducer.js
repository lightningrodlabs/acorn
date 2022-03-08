import _ from 'lodash'
import {
  simpleCreateProjectMeta,
  fetchProjectMeta,
  updateProjectMeta,
} from './actions'
// import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case simpleCreateProjectMeta.success().type:
    case fetchProjectMeta.success().type:
    case updateProjectMeta.success().type:
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
