import _ from 'lodash'
import { Action, CellIdString } from '../../../types/shared'
import { SIMPLE_CREATE_PROJECT_META } from '../projects/project-meta/actions'
import {
  SET_PROJECTS_CELL_IDS,
  JOIN_PROJECT_CELL_ID,
  REMOVE_PROJECT_CELL_ID,
} from './actions'

interface CellsState {
  projects: CellIdString[]
}

const defaultState: CellsState = {
  projects: [],
}

export default function (
  state: CellsState = defaultState,
  action: Action<CellIdString | Array<CellIdString>>
) {
  const { payload, type, meta } = action
  switch (type) {
    case SET_PROJECTS_CELL_IDS:
      return {
        ...state,
        projects: payload as Array<CellIdString>,
      }
    case SIMPLE_CREATE_PROJECT_META:
      return {
        ...state,
        projects: [...state.projects, meta.cellIdString],
      }
    case JOIN_PROJECT_CELL_ID:
      return {
        ...state,
        projects: [...state.projects.filter(cellId => cellId !== payload), payload as CellIdString],
      }
    case REMOVE_PROJECT_CELL_ID:
      return {
        ...state,
        projects: state.projects.filter((p) => p !== payload),
      }
    default:
      return state
  }
}
