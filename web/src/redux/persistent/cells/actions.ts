/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { Action, CellIdString } from "../../../types/shared"

const SET_PROFILES_CELL_ID = 'SET_PROFILES_CELL_ID'
const SET_PROJECTS_CELL_IDS = 'SET_PROJECTS_CELL_IDS'
const JOIN_PROJECT_CELL_ID = 'JOIN_PROJECT_CELL_ID'
const REMOVE_PROJECT_CELL_ID = 'REMOVE_PROJECT_CELL_ID'

/* action creator functions */

const setProfilesCellId = (cellId: CellIdString): Action<CellIdString> => {
  return {
    type: SET_PROFILES_CELL_ID,
    payload: cellId,
  }
}

const setProjectsCellIds = (cellIds: Array<CellIdString>): Action<Array<CellIdString>> => {
  return {
    type: SET_PROJECTS_CELL_IDS,
    payload: cellIds,
  }
}

const joinProjectCellId = (cellId: CellIdString): Action<CellIdString> => {
  return {
    type: JOIN_PROJECT_CELL_ID,
    payload: cellId,
  }
}

const removeProjectCellId = (cellId: CellIdString): Action<CellIdString> => {
  return {
    type: REMOVE_PROJECT_CELL_ID,
    payload: cellId,
  }
}

export {
  SET_PROFILES_CELL_ID,
  SET_PROJECTS_CELL_IDS,
  JOIN_PROJECT_CELL_ID,
  REMOVE_PROJECT_CELL_ID,
  setProfilesCellId,
  setProjectsCellIds,
  joinProjectCellId,
  removeProjectCellId
}
