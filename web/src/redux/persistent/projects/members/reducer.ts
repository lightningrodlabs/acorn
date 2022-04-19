
import _ from 'lodash'
import { WireElement } from '../../../../api/hdkCrud'
import { Member } from '../../../../types'
import { AgentPubKeyB64, CellIdString } from '../../../../types/shared'

import { SET_MEMBER, FETCH_MEMBERS } from './actions'

type State = {
  [cellId: CellIdString]: {
    [address: AgentPubKeyB64]: Member
  }
}
const defaultState: State = {}

export default function (state: State = defaultState, action) {
  const { payload, type } = action

  let cellIdString
  switch (type) {
    // FETCH_MEMBERS
    case FETCH_MEMBERS:
      cellIdString = action.meta.cellIdString
      const members = payload as Array<WireElement<Member>>
      const mapped = members.map((wireElement) => wireElement.entry)
      return {
        ...state,
        [cellIdString]: _.keyBy(mapped, 'agentPubKey'),
      }
    // SET_MEMBER
    case SET_MEMBER:
      cellIdString = payload.cellIdString
      const member = payload.member as Member
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [member.agentPubKey]: member,
        },
      }
    // DEFAULT
    default:
      return state
  }
}
