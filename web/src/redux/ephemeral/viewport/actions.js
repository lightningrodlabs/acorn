/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const ANIMATE_PAN_AND_ZOOM = 'ANIMATE_PAN_AND_ZOOM' // triggers the middleware animate action
const RESET_TRANSLATE_AND_SCALE = 'RESET_TRANSLATE_AND_SCALE'
const CHANGE_TRANSLATE = 'CHANGE_TRANSLATE'
const CHANGE_SCALE = 'CHANGE_SCALE'
const CHANGE_ALL_DIRECT = 'CHANGE_ALL_DIRECT' // is used by the middleware animate action

/* action creator functions */

function resetTranslateAndScale() {
  return {
    type: RESET_TRANSLATE_AND_SCALE,
  }
}

// TODO: this could accept a "Field of View" instead?
function animatePanAndZoom(outcomeActionHash) {
  return {
    type: ANIMATE_PAN_AND_ZOOM,
    payload: outcomeActionHash
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

function changeAllDirect(scaleAndTranslate) {
  return {
    type: CHANGE_ALL_DIRECT,
    payload: scaleAndTranslate,
  }
}

export {
  ANIMATE_PAN_AND_ZOOM,
  RESET_TRANSLATE_AND_SCALE,
  CHANGE_TRANSLATE,
  CHANGE_SCALE,
  CHANGE_ALL_DIRECT,
  resetTranslateAndScale,
  changeTranslate,
  changeScale,
  changeAllDirect,
  animatePanAndZoom,
}
