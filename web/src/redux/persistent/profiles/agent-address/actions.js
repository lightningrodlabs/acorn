/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


const FETCH_AGENT_ADDRESS = 'FETCH_AGENT_ADDRESS'
/* action creator functions */

const fetchAgentAddress = (cellIdString, payload) => {
  return {
    type: FETCH_AGENT_ADDRESS,
    payload,
    meta: { cellIdString }
  }
}

export { fetchAgentAddress, FETCH_AGENT_ADDRESS }
