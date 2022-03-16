/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


import { PROFILES_ZOME_NAME } from '../../../../holochainConfig'

// SET because it could be brand new, or an update, but treat it the same way
const SET_AGENT = 'SET_AGENT'
const CREATE_IMPORTED_PROFILE = 'CREATE_IMPORTED_PROFILE'
const FETCH_AGENTS = 'FETCH_AGENTS'

/* action creator functions */

const setAgent = agent => {
  return {
    type: SET_AGENT,
    payload: agent,
  }
}

const createImportedProfile = (cellIdString, payload) => {
  return {
    type: CREATE_IMPORTED_PROFILE,
    payload,
    meta: { cellIdString }
  }
}
const fetchAgents = (cellIdString, payload) => {
  return {
    type: FETCH_AGENTS,
    payload,
    meta: { cellIdString }
  }
}

export { SET_AGENT, setAgent, createImportedProfile, CREATE_IMPORTED_PROFILE, fetchAgents, FETCH_AGENTS }
