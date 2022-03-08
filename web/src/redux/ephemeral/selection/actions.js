/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SELECT_EDGE = 'SELECT_EDGE'
const UNSELECT_EDGE = 'UNSELECT_EDGE'
const SELECT_GOAL = 'SELECT_GOAL'
const UNSELECT_GOAL = 'UNSELECT_GOAL'
const UNSELECT_ALL = 'UNSELECT_ALL'

/* action creator functions */

function selectEdge(address) {
  return {
    type: SELECT_EDGE,
    payload: address,
  }
}

function unselectEdge(address) {
  return {
    type: UNSELECT_EDGE,
    payload: address,
  }
}

function selectGoal(address) {
  return {
    type: SELECT_GOAL,
    payload: address,
  }
}

function unselectGoal(address) {
  return {
    type: UNSELECT_GOAL,
    payload: address,
  }
}

function unselectAll() {
  return {
    type: UNSELECT_ALL,
  }
}

export {
  SELECT_EDGE,
  UNSELECT_EDGE,
  SELECT_GOAL,
  UNSELECT_ALL,
  UNSELECT_GOAL,
  selectEdge,
  unselectEdge,
  selectGoal,
  unselectAll,
  unselectGoal,
}
