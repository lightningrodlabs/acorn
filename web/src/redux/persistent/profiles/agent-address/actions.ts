/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { Action, AgentPubKeyB64 } from '../../../../types/shared'

const SET_AGENT_ADDRESS = 'SET_AGENT_ADDRESS'
/* action creator functions */

const setAgentAddress = (
  payload: AgentPubKeyB64
): Action<AgentPubKeyB64> => {
  return {
    type: SET_AGENT_ADDRESS,
    payload,
  }
}

export { setAgentAddress, SET_AGENT_ADDRESS }
