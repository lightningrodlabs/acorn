
/* action creator functions */
const FETCH_OUTCOME_HISTORY = 'FETCH_OUTCOME_HISTORY'

const fetchOutcomeHistory = (cellIdString, payload) => {
  return {
    type: FETCH_OUTCOME_HISTORY,
    payload,
    meta: { cellIdString }
  }
}

export { FETCH_OUTCOME_HISTORY, fetchOutcomeHistory }
