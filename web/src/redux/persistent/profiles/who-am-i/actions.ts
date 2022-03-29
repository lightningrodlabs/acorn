/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


import { WireElement } from '../../../../api/hdkCrud'
import { PROFILES_ZOME_NAME } from '../../../../holochainConfig'
import { Profile, WhoAmIOutput } from '../../../../types'
import { Action, CellIdString } from '../../../../types/shared'

/* action creator functions */
const WHOAMI = 'WHOAMI'
const CREATE_WHOAMI = 'CREATE_WHOAMI'
const UPDATE_WHOAMI = 'UPDATE_WHOAMI'
const whoami = (cellIdString: CellIdString, payload: WhoAmIOutput): Action<WhoAmIOutput> => {
  return {
    type: WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

const createWhoami = (cellIdString: CellIdString, payload: WireElement<Profile>): Action<WireElement<Profile>> => {
  return {
    type: CREATE_WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

const updateWhoami = (cellIdString: CellIdString, payload: WireElement<Profile>): Action<WireElement<Profile>> => {
  return {
    type: UPDATE_WHOAMI,
    payload,
    meta: { cellIdString }
  }
}

export { whoami, WHOAMI, createWhoami, CREATE_WHOAMI, updateWhoami, UPDATE_WHOAMI }
