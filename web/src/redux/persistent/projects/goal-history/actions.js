
/* action creator functions */
const FETCH_GOAL_HISTORY = 'FETCH_GOAL_HISTORY'

const fetchGoalHistory = (cellIdString, payload) => {
  return {
    type: FETCH_GOAL_HISTORY,
    payload,
    meta: { cellIdString }
  }
}

export { FETCH_GOAL_HISTORY, fetchGoalHistory }
