import _ from 'lodash'
import {
  SIMPLE_CREATE_PROJECT_META,
} from '../projects/project-meta/actions'
import { SET_PROFILES_CELL_ID, SET_PROJECTS_CELL_IDS, JOIN_PROJECT_CELL_ID, REMOVE_PROJECT_CELL_ID } from './actions'

const defaultState = {
  profiles: null,
  projects: [],
}

export default function (state = defaultState, action) {
  const { payload, type, meta } = action
  switch (type) {
    case SET_PROFILES_CELL_ID:
      return {
        ...state,
        profiles: payload,
      }
    case SET_PROJECTS_CELL_IDS:
      return {
        ...state,
        projects: payload,
      }
    case SIMPLE_CREATE_PROJECT_META:
      return {
        ...state,
        projects: [...state.projects, meta.cellIdString],
      }
    case JOIN_PROJECT_CELL_ID:
      return {
        ...state,
        projects: [...state.projects, payload],
      }
    case REMOVE_PROJECT_CELL_ID:
      return {
        ...state,
        projects: state.projects.filter(p => p !== payload),
      }
    default:
      return state
  }
}
