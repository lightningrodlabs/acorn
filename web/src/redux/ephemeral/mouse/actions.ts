/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { ActionHashB64 } from '../../../types/shared'

/* constants */
const SET_MOUSEDOWN = 'SET_MOUSEDOWN' // boolean whether or not the mouse is down
const UNSET_MOUSEDOWN = 'UNSET_MOUSEDOWN'

const SET_LIVE_COORDINATE = 'SET_LIVE_COORDINATE' // the current mouse coordinate

const SET_COORDINATE = 'SET_COORDINATE' // the coordinate where a shift-click originated
const UNSET_COORDINATE = 'UNSET_COORDINATE'

const SET_CONTEXTMENU = 'SET_CONTEXTMENU' // the outcomeActionHash and coordinate for rendering the contextmenu
const UNSET_CONTEXTMENU = 'UNSET_CONTEXTMENU'

const SET_OUTCOMES = 'SET_OUTCOMES' // list of outcomes to be selected
const UNSET_OUTCOMES = 'UNSET_OUTCOMES'

/* action creator functions */

function setMousedown() {
  return {
    type: SET_MOUSEDOWN,
  }
}

function unsetMousedown() {
  return {
    type: UNSET_MOUSEDOWN,
  }
}

function setLiveCoordinate(coordinate: { x: number; y: number }) {
  return {
    type: SET_LIVE_COORDINATE,
    payload: coordinate,
  }
}

function setCoordinate(coordinate: { x: number; y: number }) {
  return {
    type: SET_COORDINATE,
    payload: coordinate,
  }
}

function unsetCoordinate() {
  return {
    type: UNSET_COORDINATE,
  }
}

function setContextMenu(
  outcomeActionHash: ActionHashB64,
  coordinate: { x: number; y: number }
) {
  return {
    type: SET_CONTEXTMENU,
    payload: {
      outcomeActionHash,
      coordinate,
    },
  }
}

function unsetContextMenu() {
  return {
    type: UNSET_CONTEXTMENU,
  }
}

// this is for the list of outcomeActionHashes that
// are being selected with the shift-click-drag selection box
function setOutcomes(outcomesAddresses: ActionHashB64[]) {
  return {
    type: SET_OUTCOMES,
    payload: outcomesAddresses,
  }
}

function unsetOutcomes() {
  return {
    type: UNSET_OUTCOMES,
  }
}

export {
  SET_MOUSEDOWN,
  UNSET_MOUSEDOWN,
  SET_LIVE_COORDINATE,
  SET_COORDINATE,
  UNSET_COORDINATE,
  SET_CONTEXTMENU,
  UNSET_CONTEXTMENU,
  SET_OUTCOMES,
  UNSET_OUTCOMES,
  setMousedown,
  unsetMousedown,
  setLiveCoordinate,
  setCoordinate,
  unsetCoordinate,
  setContextMenu,
  unsetContextMenu,
  setOutcomes,
  unsetOutcomes,
}
