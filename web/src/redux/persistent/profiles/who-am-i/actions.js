/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


import { PROFILES_ZOME_NAME } from '../../../../holochainConfig'

/* action creator functions */
const WHOAMI = 'WHOAMI'
const CREATE_WHOAMI = 'CREATE_WHOAMI'
const UPDATE_WHOAMI = 'UPDATE_WHOAMI'
const whoami = (cellIdString, payload) => {
  return {
    type: WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

const createWhoami = (cellIdString, payload) => {
  return {
    type: CREATE_WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

const updateWhoami = (cellIdString, payload) => {
  return {
    type: UPDATE_WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

export { whoami, WHOAMI, createWhoami, CREATE_WHOAMI, updateWhoami, UPDATE_WHOAMI }
