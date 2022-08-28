import { ActionHashB64 } from '../../../types/shared'
import {
  HOVER_CONNECTION,
  UNHOVER_CONNECTION,
  HOVER_OUTCOME,
  UNHOVER_OUTCOME,
} from './actions'
import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { DELETE_CONNECTION } from '../../persistent/projects/connections/actions'
import { CHANGE_ALL_DIRECT } from '../viewport/actions'

export interface HoverState {
  hoveredOutcome: ActionHashB64
  hoveredConnection: ActionHashB64
}

const defaultState: HoverState = {
  hoveredOutcome: null,
  hoveredConnection: null,
}

export default function (
  state: HoverState = defaultState,
  action: any
): HoverState {
  const { payload, type } = action

  switch (type) {
    case CHANGE_ALL_DIRECT:
      // in the case of running an animation,
      // which is when CHANGE_ALL_DIRECT is being fired
      // we want to act as if there is nothing being hovered
      return {
        ...state,
        hoveredConnection: null,
        hoveredOutcome: null,
      }
    case DELETE_OUTCOME_FULLY:
      // unhover if the deleted Outcome was hovered over
      return state.hoveredOutcome === payload.outcomeActionHash
        ? {
            ...state,
            hoveredOutcome: null,
          }
        : { ...state }
    case DELETE_CONNECTION:
      // unhover if the deleted connection was hovered over
      return state.hoveredConnection === payload.actionHash
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
