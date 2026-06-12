import {
  SELECT_CONNECTION,
  UNSELECT_CONNECTION,
  SELECT_OUTCOME,
  UNSELECT_OUTCOME,
  UNSELECT_ALL,
  SET_CHANGED_OUTCOMES,
  CLEAR_CHANGED_OUTCOMES,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { DELETE_CONNECTION } from '../../persistent/projects/connections/actions'
import { ActionHashB64 } from '../../../types/shared'
import { OutcomeChangeStatsMap } from '../../../migrating/projectDiff'

export interface SelectionState {
  selectedOutcomes: ActionHashB64[]
  selectedConnections: ActionHashB64[]
  // outcomes an applied diff changed (i3a) — drawn with a distinct glow
  changedOutcomes: ActionHashB64[]
  // per-node +/~/− counts for those outcomes (i3b) — drawn as badges
  changedOutcomeStats: OutcomeChangeStatsMap
}

const defaultState: SelectionState = {
  selectedOutcomes: [],
  selectedConnections: [],
  changedOutcomes: [],
  changedOutcomeStats: {},
}

// removes an item from an array without mutating original array
function arrayWithoutElement(array, elem) {
  const newArray = array.slice()
  const index = newArray.indexOf(elem)
  if (index > -1) {
    newArray.splice(index, 1)
  }
  return newArray
}

export default function (state = defaultState, action: any): SelectionState {
  const { payload, type } = action

  switch (type) {
    case DELETE_OUTCOME_FULLY:
      // unselect if the deleted Outcome was selected
      return state.selectedOutcomes.includes(payload.outcomeActionHash)
        ? {
            ...state,
            selectedOutcomes: arrayWithoutElement(
              state.selectedOutcomes,
              payload.outcomeActionHash
            ),
          }
        : { ...state }
    case DELETE_CONNECTION:
      // unselect if the deleted Outcome was selected
      return state.selectedConnections.includes(payload.actionHash)
        ? {
            ...state,
            selectedConnections: arrayWithoutElement(
              state.selectedConnections,
              payload.actionHash
            ),
          }
        : { ...state }
    case SELECT_CONNECTION:
      return {
        ...state,
        selectedConnections:
          state.selectedConnections.indexOf(payload) > -1
            ? state.selectedConnections.slice() // you should create a new copy of the array, regardless, because redux
            : state.selectedConnections.concat([payload]), // combine the existing list of selected with the new one to add
      }
    case UNSELECT_CONNECTION:
      return {
        ...state,
        selectedConnections: state.selectedConnections.filter(
          (actionHash) => actionHash !== payload
        ),
      }
    case SELECT_OUTCOME:
      return {
        ...state,
        selectedOutcomes:
          state.selectedOutcomes.indexOf(payload) > -1
            ? state.selectedOutcomes.slice() // you should create a new copy of the array, regardless, because redux
            : state.selectedOutcomes.concat([payload]), // combine the existing list of selected with the new one to add
      }
    case UNSELECT_OUTCOME:
      return {
        ...state,
        selectedOutcomes: state.selectedOutcomes.filter(
          (actionHash) => actionHash !== payload
        ),
      }
    case UNSELECT_ALL:
      // clicking the background exits diff-review mode too (clears the glow)
      return {
        ...state,
        selectedOutcomes: [],
        selectedConnections: [],
        changedOutcomes: [],
        changedOutcomeStats: {},
      }
    case SET_CHANGED_OUTCOMES:
      return {
        ...state,
        changedOutcomes: payload.addresses,
        changedOutcomeStats: payload.stats || {},
      }
    case CLEAR_CHANGED_OUTCOMES:
      return { ...state, changedOutcomes: [], changedOutcomeStats: {} }
    default:
      return state
  }
}
