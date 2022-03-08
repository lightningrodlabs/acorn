/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SET_MOUSEDOWN = 'SET_MOUSEDOWN'
const UNSET_MOUSEDOWN = 'UNSET_MOUSEDOWN'
const SET_LIVE_COORDINATE = 'SET_LIVE_COORDINATE'
const SET_COORDINATE = 'SET_COORDINATE'
const UNSET_COORDINATE = 'UNSET_COORDINATE'
const SET_SIZE = 'SET_SIZE'
const UNSET_SIZE = 'UNSET_SIZE'
const SET_GOALS = 'SET_GOALS'
const UNSET_GOALS = 'UNSET_GOALS'

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

function setLiveCoordinate(coordinate) {
  return {
    type: SET_LIVE_COORDINATE,
    coordinate,
  }
}

function setCoordinate(coordinate) {
  return {
    type: SET_COORDINATE,
    coordinate,
  }
}

function unsetCoordinate() {
  return {
    type: UNSET_COORDINATE,
  }
}
function setSize(size) {
  return {
    type: SET_SIZE,
    size,
  }
}

function unsetSize() {
  return {
    type: UNSET_SIZE,
  }
}
function setGoals(goalsAddresses) {
  return {
    type: SET_GOALS,
    goalsAddresses,
  }
}

function unsetGoals() {
  return {
    type: UNSET_GOALS,
  }
}

export {
  SET_MOUSEDOWN,
  UNSET_MOUSEDOWN,
  SET_LIVE_COORDINATE,
  SET_COORDINATE,
  UNSET_COORDINATE,
  SET_SIZE,
  UNSET_SIZE,
  SET_GOALS,
  UNSET_GOALS,
  setMousedown,
  unsetMousedown,
  setLiveCoordinate,
  setCoordinate,
  unsetCoordinate,
  setSize,
  unsetSize,
  setGoals,
  unsetGoals,
}
