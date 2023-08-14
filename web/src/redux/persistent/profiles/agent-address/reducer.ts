import _ from 'lodash'
import { Action, AgentPubKeyB64 } from '../../../../types/shared'

import { FETCH_AGENT_ADDRESS } from './actions'

type State = AgentPubKeyB64
const defaultState = ''

export default function (
  state: State = defaultState,
  action: Action<AgentPubKeyB64>
) {
  const { payload, type } = action
  switch (type) {
    case FETCH_AGENT_ADDRESS:
      return payload
    default:
      return state
  }
}
