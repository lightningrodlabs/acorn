const SET_GOAL_CLONE = 'SET_GOAL_CLONE'

function setGoalClone(goals) {
  return {
    type: SET_GOAL_CLONE,
    payload: goals,
  }
}
export { SET_GOAL_CLONE, setGoalClone }
