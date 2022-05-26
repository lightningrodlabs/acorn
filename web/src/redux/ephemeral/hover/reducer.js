

import { HOVER_CONNECTION, UNHOVER_CONNECTION, HOVER_OUTCOME, UNHOVER_OUTCOME } from './actions'
import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { DELETE_CONNECTION } from '../../persistent/projects/connections/actions'

const defaultState = {
  hoveredOutcome: null,
  hoveredConnection: null,
}

export default function (state = defaultState, action) {
  const { payload, type } = action

  switch (type) {
    case DELETE_OUTCOME_FULLY:
      // unhover if the deleted Outcome was hovered over
      return state.hoveredOutcome === payload.outcomeHeaderHash
        ? {
            ...state,
            hoveredOutcome: null,
          }
        : { ...state }
    case DELETE_CONNECTION:
      // unhover if the deleted connection was hovered over
      return state.hoveredConnection === payload.headerHash
        ? {
            ...state,
            hoveredConnection: null,
          }
        : { ...state }
    case HOVER_CONNECTION:
      return {
        ...state,
        hoveredConnection: payload,
      }
    case UNHOVER_CONNECTION:
      return {
        ...state,
        hoveredConnection: null,
      }
    case HOVER_OUTCOME:
      return {
        ...state,
        hoveredOutcome: payload,
      }
    case UNHOVER_OUTCOME:
      return {
        ...state,
        hoveredOutcome: null,
      }
    default:
      return state
  }
}
