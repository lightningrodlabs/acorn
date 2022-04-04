const START_TITLE_EDIT = 'START_TITLE_EDIT'
const END_TITLE_EDIT = 'END_TITLE_EDIT'
const START_DESCRIPTION_EDIT = 'START_DESCRIPTION_EDIT'
const END_DESCRIPTION_EDIT = 'END_DESCRIPTION_EDIT'

function startTitleEdit(outcomeHeaderHash) {
  return {
    type: START_TITLE_EDIT,
    payload: {
      outcomeHeaderHash,
    },
  }
}
function endTitleEdit(outcomeHeaderHash) {
  return {
    type: END_TITLE_EDIT,
    payload: {
      outcomeHeaderHash,
    },
  }
}
function startDescriptionEdit(outcomeHeaderHash) {
  return {
    type: START_DESCRIPTION_EDIT,
    payload: {
      outcomeHeaderHash,
    },
  }
}
function endDescriptionEdit(outcomeHeaderHash) {
  return {
    type: END_DESCRIPTION_EDIT,
    payload: {
      outcomeHeaderHash,
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
