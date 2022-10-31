/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { CellIdString } from '../../../types/shared'

const SET_ACTIVE_PROJECT = 'SET_ACTIVE_PROJECT'

/* action creator functions */

const setActiveProject = (projectId: CellIdString) => {
  return {
    type: SET_ACTIVE_PROJECT,
    payload: projectId,
  }
}

export { SET_ACTIVE_PROJECT, setActiveProject }
