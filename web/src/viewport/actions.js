/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const RESET_TRANSLATE_AND_SCALE = 'RESET_TRANSLATE_AND_SCALE'
const CHANGE_TRANSLATE = 'CHANGE_TRANSLATE'
const CHANGE_SCALE = 'CHANGE_SCALE'

/* action creator functions */

function resetTranslateAndScale() {
  return {
    type: RESET_TRANSLATE_AND_SCALE,
  }
}

function changeTranslate(x, y) {
  return {
    type: CHANGE_TRANSLATE,
    payload: {
      x,
      y,
    },
  }
}

function changeScale(zoom, mouseX, mouseY) {
  return {
    type: CHANGE_SCALE,
    payload: {
      zoom,
      mouseX,
      mouseY,
    },
  }
}

export {
  RESET_TRANSLATE_AND_SCALE,
  CHANGE_TRANSLATE,
  CHANGE_SCALE,
  resetTranslateAndScale,
  changeTranslate,
  changeScale,
}
