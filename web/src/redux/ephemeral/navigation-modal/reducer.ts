import _ from 'lodash'
import { SET_OPEN_PARENTS, SET_CLOSED, SET_OPEN_CHILDREN } from './actions'
import { ActionHashB64 } from '../../../types/shared'

type NavigationModalState = {
  open: boolean
  isChildren: boolean
  outcomeActionHashes: ActionHashB64[]
}
const defaultState: NavigationModalState = {
  open: false,
  isChildren: false,
  outcomeActionHashes: [],
}

export default function (
  state = defaultState,
  action: any
): typeof defaultState {
  const { type, payload } = action
  switch (type) {
    case SET_CLOSED:
      return {
        ...state,
        open: false,
        isChildren: false,
        outcomeActionHashes: [],
      }
    case SET_OPEN_CHILDREN:
      return {
        ...state,
        open: true,
        isChildren: true,
        outcomeActionHashes: payload,
      }
    case SET_OPEN_PARENTS:
      return {
        ...state,
        open: true,
        isChildren: false,
        outcomeActionHashes: payload,
      }
    default:
      return state
  }
}
