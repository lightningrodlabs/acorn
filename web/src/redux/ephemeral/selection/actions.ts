/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { ActionHashB64 } from "../../../types/shared"

/* constants */
const SELECT_CONNECTION = 'SELECT_CONNECTION'
const UNSELECT_CONNECTION = 'UNSELECT_CONNECTION'
const SELECT_OUTCOME = 'SELECT_OUTCOME'
const UNSELECT_OUTCOME = 'UNSELECT_OUTCOME'
const UNSELECT_ALL = 'UNSELECT_ALL'

/* action creator functions */

function selectConnection(address: ActionHashB64) {
  return {
    type: SELECT_CONNECTION,
    payload: address,
  }
}

function unselectConnection(address: ActionHashB64) {
  return {
    type: UNSELECT_CONNECTION,
    payload: address,
  }
}

function selectOutcome(address: ActionHashB64) {
  return {
    type: SELECT_OUTCOME,
    payload: address,
  }
}

function unselectOutcome(address: ActionHashB64) {
  return {
    type: UNSELECT_OUTCOME,
    payload: address,
  }
}

function unselectAll() {
  return {
    type: UNSELECT_ALL,
  }
}

export {
  SELECT_CONNECTION,
  UNSELECT_CONNECTION,
  SELECT_OUTCOME,
  UNSELECT_ALL,
  UNSELECT_OUTCOME,
  selectConnection,
  unselectConnection,
  selectOutcome,
  unselectAll,
  unselectOutcome,
}
