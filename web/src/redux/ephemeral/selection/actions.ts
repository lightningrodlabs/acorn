/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { ActionHashB64 } from '../../../types/shared'
import { OutcomeChangeStatsMap } from '../../../migrating/projectDiff'

/* constants */
const SELECT_CONNECTION = 'SELECT_CONNECTION'
const UNSELECT_CONNECTION = 'UNSELECT_CONNECTION'
const SELECT_OUTCOME = 'SELECT_OUTCOME'
const UNSELECT_OUTCOME = 'UNSELECT_OUTCOME'
const UNSELECT_ALL = 'UNSELECT_ALL'
// the set of outcomes an applied diff changed — a distinct "changed" glow,
// separate from selection (clarity-tree i3a)
const SET_CHANGED_OUTCOMES = 'SET_CHANGED_OUTCOMES'
const CLEAR_CHANGED_OUTCOMES = 'CLEAR_CHANGED_OUTCOMES'

/* action creator functions */

function setChangedOutcomes(
  addresses: ActionHashB64[],
  // per-node +/~/− counts keyed by the same (live) hashes (i3b badges)
  stats: OutcomeChangeStatsMap = {}
) {
  return {
    type: SET_CHANGED_OUTCOMES,
    payload: { addresses, stats },
  }
}

function clearChangedOutcomes() {
  return {
    type: CLEAR_CHANGED_OUTCOMES,
  }
}

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
  SET_CHANGED_OUTCOMES,
  CLEAR_CHANGED_OUTCOMES,
  selectConnection,
  unselectConnection,
  selectOutcome,
  unselectAll,
  unselectOutcome,
  setChangedOutcomes,
  clearChangedOutcomes,
}
