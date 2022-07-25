const START_TITLE_EDIT = 'START_TITLE_EDIT'
const END_TITLE_EDIT = 'END_TITLE_EDIT'
const START_DESCRIPTION_EDIT = 'START_DESCRIPTION_EDIT'
const END_DESCRIPTION_EDIT = 'END_DESCRIPTION_EDIT'

function startTitleEdit(outcomeActionHash) {
  return {
    type: START_TITLE_EDIT,
    payload: {
      outcomeActionHash,
    },
  }
}
function endTitleEdit(outcomeActionHash) {
  return {
    type: END_TITLE_EDIT,
    payload: {
      outcomeActionHash,
    },
  }
}
function startDescriptionEdit(outcomeActionHash) {
  return {
    type: START_DESCRIPTION_EDIT,
    payload: {
      outcomeActionHash,
    },
  }
}
function endDescriptionEdit(outcomeActionHash) {
  return {
    type: END_DESCRIPTION_EDIT,
    payload: {
      outcomeActionHash,
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
