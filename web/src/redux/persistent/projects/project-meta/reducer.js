import _ from 'lodash'
import {
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  UPDATE_PROJECT_META 
} from './actions'

const defaultState = {}

export default function (state = defaultState, action) {
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
