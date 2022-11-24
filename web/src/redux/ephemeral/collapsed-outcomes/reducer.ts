import { ActionHashB64, CellIdString } from '../../../types/shared'
import {
  COLLAPSE_OUTCOME,
  EXPAND_OUTCOME,
  EXPAND_ALL_OUTCOMES,
} from './actions'

export interface CollapsedOutcomesState {
  collapsedOutcomes: {
    [projectId: CellIdString]: {
      [outcomeActionHash: ActionHashB64]: boolean
    }
  }
}

const defaultState: CollapsedOutcomesState = {
  collapsedOutcomes: {},
}

export default function (
  state = defaultState,
  action: any
): CollapsedOutcomesState {
  const { payload, type } = action
  switch (type) {
    case COLLAPSE_OUTCOME:
      return {
        ...state,
        collapsedOutcomes: {
          ...state.collapsedOutcomes,
          [payload.projectCellId]: {
            ...state.collapsedOutcomes[payload.projectCellId],
            [payload.outcomeActionHash]: true,
          },
        },
      }
    case EXPAND_OUTCOME:
      return {
        ...state,
        collapsedOutcomes: {
          ...state.collapsedOutcomes,
          [payload.projectCellId]: {
            ...state.collapsedOutcomes[payload.projectCellId],
            [payload.outcomeActionHash]: false,
          },
        },
      }
    case EXPAND_ALL_OUTCOMES:
      return {
        ...state,
        collapsedOutcomes: {
          ...state.collapsedOutcomes,
          [payload]: {}, // reset
        },
      }
    default:
      return state
  }
}
