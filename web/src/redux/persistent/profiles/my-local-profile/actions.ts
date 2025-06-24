/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { Profile } from '../../../../types'
import { Action } from '../../../../types/shared'

// SET because it could be brand new, or an update, but treat it the same way
const SET_MY_LOCAL_PROFILE = 'SET_MY_LOCAL_PROFILE'

/* action creator functions */

const setMyLocalProfile = (
  payload: Profile
): Action<Profile> => {
  return {
    type: SET_MY_LOCAL_PROFILE,
    payload,
  }
}

export {
  SET_MY_LOCAL_PROFILE,
  setMyLocalProfile,
}