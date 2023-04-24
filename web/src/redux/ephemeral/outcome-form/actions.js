/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

/* constants */
const OPEN_OUTCOME_FORM = 'OPEN_OUTCOME_FORM'
const CLOSE_OUTCOME_FORM = 'CLOSE_OUTCOME_FORM'
const UPDATE_CONTENT = 'UPDATE_CONTENT'

/* action creator functions */

// fromAddress and relation are optional
// but should be passed together
function openOutcomeForm(x, y, editAddress, fromAddress, relation) {
  return {
    type: OPEN_OUTCOME_FORM,
    payload: {
      editAddress,
      x,
      y,
      fromAddress,
      relation,
    },
  }
}

function closeOutcomeForm() {
  return {
    type: CLOSE_OUTCOME_FORM,
  }
}

function updateContent(content) {
  return {
    type: UPDATE_CONTENT,
    payload: content,
  }
}

export {
  OPEN_OUTCOME_FORM,
  CLOSE_OUTCOME_FORM,
  UPDATE_CONTENT,
  openOutcomeForm,
  closeOutcomeForm,
  updateContent,
}
