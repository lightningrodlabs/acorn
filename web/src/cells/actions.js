/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

const SET_PROFILES_CELL_ID = 'SET_PROFILES_CELL_ID'
const SET_PROJECTS_CELL_IDS = 'SET_PROJECTS_CELL_IDS'
const JOIN_PROJECT_CELL_ID = 'JOIN_PROJECT_CELL_ID'

/* action creator functions */

const setProfilesCellId = cellId => {
  return {
    type: SET_PROFILES_CELL_ID,
    payload: cellId,
  }
}

const setProjectsCellIds = cellIds => {
  return {
    type: SET_PROJECTS_CELL_IDS,
    payload: cellIds,
  }
}

const joinProjectCellId = cellId => {
  return {
    type: JOIN_PROJECT_CELL_ID,
    payload: cellId,
  }
}

export {
  SET_PROFILES_CELL_ID,
  SET_PROJECTS_CELL_IDS,
  JOIN_PROJECT_CELL_ID,
  setProfilesCellId,
  setProjectsCellIds,
  joinProjectCellId
}
