/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { ActionHashB64 } from '@holochain/client'

const SET_OPEN_PARENTS = 'SET_OPEN_PARENTS'
const SET_OPEN_CHILDREN = 'SET_OPEN_CHILDREN'
const SET_CLOSED = 'SET_CLOSED'

/* action creator functions */

const setNavModalOpenParents = (payload: ActionHashB64[]) => {
  return {
    type: SET_OPEN_PARENTS,
    payload,
  }
}

const setNavModalOpenChildren = (payload: ActionHashB64[]) => {
  return {
    type: SET_OPEN_CHILDREN,
    payload,
  }
}

const setNavModalClosed = () => {
  return {
    type: SET_CLOSED,
  }
}
export {
  SET_CLOSED,
  SET_OPEN_CHILDREN,
  SET_OPEN_PARENTS,
  setNavModalClosed,
  setNavModalOpenChildren,
  setNavModalOpenParents,
}
