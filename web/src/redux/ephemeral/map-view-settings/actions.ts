/*
  There should be an actions.ts file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { CellIdString } from '../../../types/shared'

/* constants */
const SHOW_ACHIEVED_OUTCOMES = 'SHOW_ACHIEVED_OUTCOMES'
const HIDE_ACHIEVED_OUTCOMES = 'HIDE_ACHIEVED_OUTCOMES'
const SHOW_SMALL_OUTCOMES = 'SHOW_SMALL_OUTCOMES'
const HIDE_SMALL_OUTCOMES = 'HIDE_SMALL_OUTCOMES'
const SET_SELECTED_LAYERING_ALGO = 'SET_SELECTED_LAYERING_ALGO'

/* action creator functions */

function showAchievedOutcomes(projectCellId: CellIdString) {
  return {
    type: SHOW_ACHIEVED_OUTCOMES,
    payload: projectCellId,
  }
}
function hideAchievedOutcomes(projectCellId: CellIdString) {
  return {
    type: HIDE_ACHIEVED_OUTCOMES,
    payload: projectCellId,
  }
}
function showSmallOutcomes(projectCellId: CellIdString) {
  return {
    type: SHOW_SMALL_OUTCOMES,
    payload: projectCellId,
  }
}

function hideSmallOutcomes(projectCellId: CellIdString) {
  return {
    type: HIDE_SMALL_OUTCOMES,
    payload: projectCellId,
  }
}

export {
  SHOW_ACHIEVED_OUTCOMES,
  HIDE_ACHIEVED_OUTCOMES,
  SHOW_SMALL_OUTCOMES,
  HIDE_SMALL_OUTCOMES,
  SET_SELECTED_LAYERING_ALGO,
  showAchievedOutcomes,
  hideAchievedOutcomes,
  showSmallOutcomes,
  hideSmallOutcomes,
}
