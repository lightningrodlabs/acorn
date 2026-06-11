import { LayeringAlgorithm } from '../../../types'
import { ActionHashB64, CellIdString } from '../../../types/shared'
import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { SELECT_OUTCOME } from '../selection/actions'
import {
  HIDE_ACHIEVED_OUTCOMES,
  SHOW_ACHIEVED_OUTCOMES,
  HIDE_SMALL_OUTCOMES,
  SHOW_SMALL_OUTCOMES,
  ENABLE_FOCUS_MODE,
  DISABLE_FOCUS_MODE,
} from './actions'

export interface CollapsedOutcomesState {
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: LayeringAlgorithm
  // projects for which focus+context (Degree-of-Interest based)
  // rendering is switched on
  focusModeProjects: CellIdString[]
  // the most recently selected Outcome, which acts as the focus
  // point for focus mode. it deliberately persists through unselects,
  // so that the map doesn't reflow every time the user clicks on
  // empty canvas
  focusOutcome: ActionHashB64 | null
}

const defaultState: CollapsedOutcomesState = {
  hiddenAchievedOutcomes: [],
  hiddenSmallOutcomes: [],
  selectedLayeringAlgo: LayeringAlgorithm.LongestPath,
  focusModeProjects: [],
  focusOutcome: null,
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
    case ENABLE_FOCUS_MODE:
      return {
        ...state,
        focusModeProjects: state.focusModeProjects.includes(payload)
          ? state.focusModeProjects.slice()
          : [...state.focusModeProjects, payload],
      }
    case DISABLE_FOCUS_MODE:
      return {
        ...state,
        focusModeProjects: state.focusModeProjects.filter(
          (projectCellId) => projectCellId !== payload
        ),
      }
    case SELECT_OUTCOME:
      // track the most recently selected Outcome as
      // the focus point for focus mode
      return {
        ...state,
        focusOutcome: payload,
      }
    case DELETE_OUTCOME_FULLY:
      return state.focusOutcome === payload.outcomeActionHash
        ? {
            ...state,
            focusOutcome: null,
          }
        : state
    default:
      return state
  }
}
