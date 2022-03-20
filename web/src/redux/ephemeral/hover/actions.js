/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const HOVER_CONNECTION = 'HOVER_CONNECTION'
const UNHOVER_CONNECTION = 'UNHOVER_CONNECTION'
const HOVER_OUTCOME = 'HOVER_OUTCOME'
const UNHOVER_OUTCOME = 'UNHOVER_OUTCOME'

/* action creator functions */

function hoverConnection(address) {
  return {
    type: HOVER_CONNECTION,
    payload: address,
  }
}

function unhoverConnection() {
  return {
    type: UNHOVER_CONNECTION,
  }
}

function hoverOutcome(address) {
  return {
    type: HOVER_OUTCOME,
    payload: address,
  }
}

function unhoverOutcome() {
  return {
    type: UNHOVER_OUTCOME,
  }
}

export {
  HOVER_CONNECTION,
  UNHOVER_CONNECTION,
  HOVER_OUTCOME,
  UNHOVER_OUTCOME,
  hoverConnection,
  unhoverConnection,
  hoverOutcome,
  unhoverOutcome,
}
