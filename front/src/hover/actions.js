/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const HOVER_EDGE = 'HOVER_EDGE'
const UNHOVER_EDGE = 'UNHOVER_EDGE'
const HOVER_GOAL = 'HOVER_GOAL'
const UNHOVER_GOAL = 'UNHOVER_GOAL'

/* action creator functions */

function hoverEdge(address) {
  return {
    type: HOVER_EDGE,
    payload: address,
  }
}

function unhoverEdge() {
  return {
    type: UNHOVER_EDGE,
  }
}

function hoverGoal(address) {
  return {
    type: HOVER_GOAL,
    payload: address,
  }
}

function unhoverGoal() {
  return {
    type: UNHOVER_GOAL,
  }
}

export {
  HOVER_EDGE,
  UNHOVER_EDGE,
  HOVER_GOAL,
  UNHOVER_GOAL,
  hoverEdge,
  unhoverEdge,
  hoverGoal,
  unhoverGoal,
}
