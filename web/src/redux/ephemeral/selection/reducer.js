

import {
  SELECT_CONNECTION,
  UNSELECT_CONNECTION,
  SELECT_OUTCOME,
  UNSELECT_OUTCOME,
  UNSELECT_ALL,
} from './actions'
import { deleteOutcomeFully, DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { deleteConnection, DELETE_CONNECTION } from '../../persistent/projects/connections/actions'

const defaultState = {
  selectedOutcomes: [],
  selectedConnections: [],
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

export default function (state = defaultState, action) {
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
          actionHash => actionHash !== payload
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
          actionHash => actionHash !== payload
        ),
      }
    case UNSELECT_ALL:
      return {
        ...state,
        selectedOutcomes: [],
        selectedConnections: [],
      }
    default:
      return state
  }
}
