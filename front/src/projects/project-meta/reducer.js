import _ from 'lodash'
import {
  createProjectMeta,
  fetchProjectMetas,
  fetchProjectMeta,
  updateProjectMeta,
  archiveProjectMeta,
} from './actions'
// import { isCrud, crudReducer } from '../../crudRedux'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case createProjectMeta.success().type:
    case fetchProjectMeta.success().type:
    case updateProjectMeta.success().type:
      return {
        ...state,
        [action.meta.cellIdString]: {
          ...payload.entry,
          address: payload.address,
        },
      }
    default:
      return state
  }
}
