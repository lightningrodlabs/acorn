import { CellIdString } from '../../../types/shared'
import {
  HIDE_ACHIEVED_OUTCOMES,
  SHOW_ACHIEVED_OUTCOMES,
  HIDE_SMALL_OUTCOMES,
  SHOW_SMALL_OUTCOMES,
  SET_SELECTED_LAYERING_ALGO,
} from './actions'

export interface CollapsedOutcomesState {
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: string
}

const defaultState: CollapsedOutcomesState = {
  hiddenAchievedOutcomes: [],
  hiddenSmallOutcomes: [],
  selectedLayeringAlgo: 'longestPath',
}

export default function (
  state = defaultState,
  action: any
): CollapsedOutcomesState {
  const { payload, type } = action
  switch (type) {
    case SHOW_ACHIEVED_OUTCOMES:
      return {
        ...state,
        hiddenAchievedOutcomes: state.hiddenAchievedOutcomes.filter(
          (projectCellId) => projectCellId !== payload
        ),
      }
    case HIDE_ACHIEVED_OUTCOMES:
      return {
        ...state,
        hiddenAchievedOutcomes: [...state.hiddenAchievedOutcomes, payload],
      }
    case SHOW_SMALL_OUTCOMES:
      return {
        ...state,
        hiddenSmallOutcomes: state.hiddenSmallOutcomes.filter(
          (projectCellId) => projectCellId !== payload
        ),
      }
    case HIDE_SMALL_OUTCOMES:
      return {
        ...state,
        hiddenSmallOutcomes: [...state.hiddenSmallOutcomes, payload],
      }
    case SET_SELECTED_LAYERING_ALGO:
      return {
        ...state,
        selectedLayeringAlgo: payload,
      }
    default:
      return state
  }
}
