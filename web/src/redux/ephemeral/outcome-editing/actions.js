const START_TITLE_EDIT = 'START_TITLE_EDIT'
const END_TITLE_EDIT = 'END_TITLE_EDIT'
const START_DESCRIPTION_EDIT = 'START_DESCRIPTION_EDIT'
const END_DESCRIPTION_EDIT = 'END_DESCRIPTION_EDIT'

function startTitleEdit(outcomeAddress) {
  return {
    type: START_TITLE_EDIT,
    payload: {
      outcomeAddress,
    },
  }
}
function endTitleEdit(outcomeAddress) {
  return {
    type: END_TITLE_EDIT,
    payload: {
      outcomeAddress,
    },
  }
}
function startDescriptionEdit(outcomeAddress) {
  return {
    type: START_DESCRIPTION_EDIT,
    payload: {
      outcomeAddress,
    },
  }
}
function endDescriptionEdit(outcomeAddress) {
  return {
    type: END_DESCRIPTION_EDIT,
    payload: {
      outcomeAddress,
    },
  }
}

export {
  START_TITLE_EDIT,
  END_TITLE_EDIT,
  START_DESCRIPTION_EDIT,
  END_DESCRIPTION_EDIT,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
}
