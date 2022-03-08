/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const SET_SCREEN_DIMENSIONS = 'SET_SCREEN_DIMENSIONS'

/* action creator functions */

function setScreenDimensions(width, height) {
  return {
    type: SET_SCREEN_DIMENSIONS,
    payload: {
      width,
      height,
    },
  }
}

export { SET_SCREEN_DIMENSIONS, setScreenDimensions }
