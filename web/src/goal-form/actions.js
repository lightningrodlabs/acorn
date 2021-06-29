/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const OPEN_GOAL_FORM = 'OPEN_GOAL_FORM'
const CLOSE_GOAL_FORM = 'CLOSE_GOAL_FORM'
const UPDATE_CONTENT = 'UPDATE_CONTENT'

/* action creator functions */

// fromAddress and relation are optional
// but should be passed together
function openGoalForm(x, y, editAddress, fromAddress, relation) {
  return {
    type: OPEN_GOAL_FORM,
    payload: {
      editAddress,
      x,
      y,
      fromAddress,
      relation
    },
  }
}

function closeGoalForm() {
  return {
    type: CLOSE_GOAL_FORM,
  }
}

function updateContent(content) {
  return {
    type: UPDATE_CONTENT,
    payload: content,
  }
}

export {
  OPEN_GOAL_FORM,
  CLOSE_GOAL_FORM,
  UPDATE_CONTENT,
  openGoalForm,
  closeGoalForm,
  updateContent,
}
