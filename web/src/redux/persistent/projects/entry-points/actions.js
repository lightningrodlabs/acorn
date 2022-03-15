/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { createCrudActionCreators } from '../../crudRedux'

const FETCH_ENTRY_POINT_DETAILS = 'FETCH_ENTRY_POINT_DETAILS'

const fetchEntryPointDetails = (cellIdString, payload) => {
  return {
    type: FETCH_ENTRY_POINT_DETAILS,
    payload,
    meta: { cellIdString }
  }
}

const [[
  CREATE_ENTRY_POINT,
  FETCH_ENTRY_POINTS,
  UPDATE_ENTRY_POINT,
  DELETE_ENTRY_POINT
],[
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  deleteEntryPoint,
]] = createCrudActionCreators('ENTRY_POINT')

export {
  CREATE_ENTRY_POINT,
  FETCH_ENTRY_POINTS,
  UPDATE_ENTRY_POINT,
  DELETE_ENTRY_POINT,
  FETCH_ENTRY_POINT_DETAILS,
  createEntryPoint,
  fetchEntryPoints,
  updateEntryPoint,
  deleteEntryPoint,
  // non-standard
  fetchEntryPointDetails,
}
