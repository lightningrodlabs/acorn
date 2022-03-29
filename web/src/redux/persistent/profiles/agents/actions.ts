/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


import { WireElement } from '../../../../api/hdkCrud'
import { PROFILES_ZOME_NAME } from '../../../../holochainConfig'
import { Profile } from '../../../../types'
import { Action, CellIdString } from '../../../../types/shared'

// SET because it could be brand new, or an update, but treat it the same way
const SET_AGENT = 'SET_AGENT'
const CREATE_IMPORTED_PROFILE = 'CREATE_IMPORTED_PROFILE'
const FETCH_AGENTS = 'FETCH_AGENTS'

/* action creator functions */

// what type is agent here?
const setAgent = agent => {
  return {
    type: SET_AGENT,
    payload: agent,
  }
}

const createImportedProfile = (cellIdString: CellIdString, payload: WireElement<Profile>): Action<WireElement<Profile>> => {
  return {
    type: CREATE_IMPORTED_PROFILE,
    payload,
    meta: { cellIdString }
  }
}
const fetchAgents = (cellIdString: CellIdString, payload: Array<Profile>): Action<Array<Profile>> => {
  return {
    type: FETCH_AGENTS,
    payload,
    meta: { cellIdString }
  }
}

export { SET_AGENT, setAgent, createImportedProfile, CREATE_IMPORTED_PROFILE, fetchAgents, FETCH_AGENTS }
