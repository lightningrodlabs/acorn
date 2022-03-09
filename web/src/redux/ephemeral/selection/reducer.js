

import {
  SELECT_EDGE,
  UNSELECT_EDGE,
  SELECT_GOAL,
  UNSELECT_GOAL,
  UNSELECT_ALL,
} from './actions'
import { archiveGoalFully } from '../../persistent/projects/goals/actions'
import { archiveEdge } from '../../persistent/projects/edges/actions'

const defaultState = {
  selectedGoals: [],
  selectedEdges: [],
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
    case archiveGoalFully.success().type:
      // unselect if the archived Goal was selected
      return state.selectedGoals.includes(payload.address)
        ? {
            ...state,
            selectedGoals: arrayWithoutElement(
              state.selectedGoals,
              payload.address
            ),
          }
        : { ...state }
    case archiveEdge.success().type:
      // unselect if the archived Goal was selected
      return state.selectedEdges.includes(payload.headerHash)
        ? {
            ...state,
            selectedEdges: arrayWithoutElement(
              state.selectedEdges,
              payload.headerHash
            ),
          }
        : { ...state }
    case SELECT_EDGE:
      return {
        ...state,
        selectedEdges:
          state.selectedEdges.indexOf(payload) > -1
            ? state.selectedEdges.slice() // you should create a new copy of the array, regardless, because redux
            : state.selectedEdges.concat([payload]), // combine the existing list of selected with the new one to add
      }
    case UNSELECT_EDGE:
      return {
        ...state,
        selectedEdges: state.selectedEdges.filter(
          headerHash => headerHash !== payload
        ),
      }
    case SELECT_GOAL:
      return {
        ...state,
        selectedGoals:
          state.selectedGoals.indexOf(payload) > -1
            ? state.selectedGoals.slice() // you should create a new copy of the array, regardless, because redux
            : state.selectedGoals.concat([payload]), // combine the existing list of selected with the new one to add
      }
    case UNSELECT_GOAL:
      return {
        ...state,
        selectedGoals: state.selectedGoals.filter(
          headerHash => headerHash !== payload
        ),
      }
    case UNSELECT_ALL:
      return {
        ...state,
        selectedGoals: [],
        selectedEdges: [],
      }
    default:
      return state
  }
}
