

import { HOVER_EDGE, UNHOVER_EDGE, HOVER_GOAL, UNHOVER_GOAL } from './actions'
import { archiveGoalFully } from '../../persistent/projects/goals/actions'
import { archiveEdge } from '../../persistent/projects/edges/actions'

const defaultState = {
  hoveredGoal: null,
  hoveredEdge: null,
}

export default function (state = defaultState, action) {
  const { payload, type } = action

  switch (type) {
    case archiveGoalFully.success().type:
      // unhover if the archived Goal was hovered over
      return state.hoveredGoal === payload.address
        ? {
            ...state,
            hoveredGoal: null,
          }
        : { ...state }
    case archiveEdge.success().type:
      // unhover if the archived edge was hovered over
      return state.hoveredEdge === payload.headerHash
        ? {
            ...state,
            hoveredEdge: null,
          }
        : { ...state }
    case HOVER_EDGE:
      return {
        ...state,
        hoveredEdge: payload,
      }
    case UNHOVER_EDGE:
      return {
        ...state,
        hoveredEdge: null,
      }
    case HOVER_GOAL:
      return {
        ...state,
        hoveredGoal: payload,
      }
    case UNHOVER_GOAL:
      return {
        ...state,
        hoveredGoal: null,
      }
    default:
      return state
  }
}
