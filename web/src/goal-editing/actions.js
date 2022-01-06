const START_TITLE_EDIT = 'START_TITLE_EDIT'
const END_TITLE_EDIT = 'END_TITLE_EDIT'
const START_DESCRIPTION_EDIT = 'START_DESCRIPTION_EDIT'
const END_DESCRIPTION_EDIT = 'END_DESCRIPTION_EDIT'

function startTitleEdit(goalAddress, agentAddress) {
  return {
    type: START_TITLE_EDIT,
    payload: {
      goalAddress,
      agentAddress,
    },
  }
}
function endTitleEdit(goalAddress) {
  return {
    type: END_TITLE_EDIT,
    payload: {
      goalAddress,
    },
  }
}
function startDescriptionEdit(goalAddress, agentAddress) {
  return {
    type: START_DESCRIPTION_EDIT,
    payload: {
      goalAddress,
      agentAddress,
    },
  }
}
function endDescriptionEdit(goalAddress) {
  return {
    type: END_DESCRIPTION_EDIT,
    payload: {
      goalAddress,
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
