/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const CHANGE_DEPTH_PERCEPTION = 'CHANGE_DEPTH_PERCEPTION'

/* action creator functions */

function changeDepthPerception(value: number) {
  return {
    type: CHANGE_DEPTH_PERCEPTION,
    payload: value
  }
}

export {
  CHANGE_DEPTH_PERCEPTION,
  changeDepthPerception
}
