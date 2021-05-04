/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

const SET_ACTIVE_PROJECT = 'SET_ACTIVE_PROJECT'

/* action creator functions */

const setActiveProject = projectId => {
  return {
    type: SET_ACTIVE_PROJECT,
    payload: projectId,
  }
}

export { SET_ACTIVE_PROJECT, setActiveProject }
