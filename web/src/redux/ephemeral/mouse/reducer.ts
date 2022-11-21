import { ActionHashB64 } from '../../../types/shared'
import { CHANGE_SCALE } from '../viewport/actions'
import {
  SET_MOUSEDOWN,
  UNSET_MOUSEDOWN,
  SET_LIVE_COORDINATE,
  SET_COORDINATE,
  UNSET_COORDINATE,
  SET_OUTCOMES,
  UNSET_OUTCOMES,
  SET_CONTEXTMENU,
  UNSET_CONTEXTMENU,
} from './actions'

export interface MouseState {
  mousedown: boolean
  // this is whatever current mouse coordinate is
  liveCoordinate: {
    x: number
    y: number
  }
  // this is the START coordinate for
  // an Outcome selection action
  coordinate: {
    x: number
    y: number
  }
  // right click / contextmenu coordinate
  contextMenu: {
    outcomeActionHash: ActionHashB64
    coordinate: {
      x: number
      y: number
    }
  }
  size: {
    w: number
    h: number
  }
  // this is for the list of outcomeActionHashes that
  // are being selected with the shift-click-drag selection box
  outcomesAddresses: ActionHashB64[] | null
}

const defaultState: MouseState = {
  mousedown: false,
  // this is whatever current mouse coordinate is
  liveCoordinate: {
    x: 0,
    y: 0,
  },
  // this is the START coordinate for
  // an Outcome selection action
  coordinate: {
    x: 0,
    y: 0,
  },
  // right click / contextmenu coordinate
  contextMenu: {
    outcomeActionHash: null,
    coordinate: null,
  },
  size: {
    w: 0,
    h: 0,
  },
  // this is for the list of outcomeActionHashes that
  // are being selected with the shift-click-drag selection box
  outcomesAddresses: null,
}

export default function (state = defaultState, action: any): MouseState {
  const { payload, type } = action
  switch (type) {
    case SET_MOUSEDOWN:
      return {
        ...state,
        mousedown: true,
      }
    case UNSET_MOUSEDOWN:
      return {
        ...state,
        mousedown: false,
      }
    case SET_LIVE_COORDINATE:
      return {
        ...state,
        liveCoordinate: payload,
      }
    case SET_COORDINATE:
      return {
        ...state,
        coordinate: payload,
      }
    case UNSET_COORDINATE:
      return {
        ...state,
        coordinate: { x: 0, y: 0 },
      }
    case SET_CONTEXTMENU:
      return {
        ...state,
        contextMenu: {
          outcomeActionHash: payload.outcomeActionHash,
          coordinate: payload.coordinate,
        },
      }
    case UNSET_CONTEXTMENU:
    case CHANGE_SCALE: // a side effect of changing scale is that the ContextMenu would be out of place
      return {
        ...state,
        contextMenu: {
          outcomeActionHash: null,
          coordinate: null,
        },
      }
    case SET_OUTCOMES:
      return {
        ...state,
        outcomesAddresses: payload.outcomesAddresses,
      }
    case UNSET_OUTCOMES:
      return {
        ...state,
        outcomesAddresses: null,
      }
    default:
      return state
  }
}
