const SET_OUTCOME_CLONE = 'SET_OUTCOME_CLONE'

function setOutcomeClone(outcomes) {
  return {
    type: SET_OUTCOME_CLONE,
    payload: outcomes,
  }
}
export { SET_OUTCOME_CLONE, setOutcomeClone }
