import _ from 'lodash'

import {
  SET_AGENT,
  FETCH_AGENTS,
  CREATE_IMPORTED_PROFILE,
  AgentsAction,
} from './actions'
import { CREATE_WHOAMI, UPDATE_WHOAMI } from '../who-am-i/actions'
import { AgentPubKeyB64 } from '../../../../types/shared'
import { Profile } from '../../../../types'
import { WireElement } from '../../../../api/hdkCrud'

export type AgentsState = {
  [agentPubKey: AgentPubKeyB64]: Profile
}
const defaultState: AgentsState = {}

export default function (
  state: AgentsState = defaultState,
  action: AgentsAction
): AgentsState {
  const { payload, type } = action
  switch (type) {
    case FETCH_AGENTS:
      const fetchedAgents = payload as Array<Profile>
      console.log(fetchedAgents)
      return _.keyBy(fetchedAgents, 'agentPubKey')
    case SET_AGENT:
      const setAgent = payload as WireElement<Profile>
      return {
        ...state,
        [setAgent.entry.agentPubKey]: setAgent.entry,
      }
    case CREATE_IMPORTED_PROFILE:
    case CREATE_WHOAMI:
    case UPDATE_WHOAMI:
      const agent = payload as WireElement<Profile>
      return {
        ...state,
        [agent.entry.agentPubKey]: agent.entry,
      }
    default:
      return state
  }
}
