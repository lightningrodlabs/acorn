import _ from 'lodash'
import {
  createProjectMeta,
} from '../projects/project-meta/actions'
import { SET_PROFILES_CELL_ID, SET_PROJECTS_CELL_IDS, JOIN_PROJECT_CELL_ID } from './actions'

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
    case createProjectMeta.success().type:
      return {
        ...state,
        projects: [...state.projects, meta.cellIdString],
      }
    case JOIN_PROJECT_CELL_ID:
      return {
        ...state,
        projects: [...state.projects, payload],
      }
    default:
      return state
  }
}
