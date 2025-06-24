import _ from 'lodash'
import { WireRecord } from '../../../../api/hdkCrud'
import { Member, Profile } from '../../../../types'
import { AgentPubKeyB64, CellIdString } from '../../../../types/shared'

import {
  SET_PROJECT_MEMBER,
  FETCH_PROJECT_MEMBERS,
  FETCH_PROJECT_PROFILES,
  SET_PROJECT_MEMBER_PROFILE,
  SET_PROJECT_WHOAMI,
} from './actions'

export type ProjectMembersState = {
  [address: AgentPubKeyB64]: Member
}

export type MembersState = {
  [cellId: CellIdString]: {
    members: ProjectMembersState
    profiles: Profile[]
    whoami: WireRecord<Profile>
  }
}
const defaultState: MembersState = {}

export default function (
  state: MembersState = defaultState,
  action
): MembersState {
  const { payload, type } = action

  let cellIdString
  switch (type) {
    case SET_PROJECT_WHOAMI:
      cellIdString = payload.cellIdString
      return {
        ...state,
        [cellIdString]: {
          ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }),
          whoami: payload.whoami
        }
      }
    case FETCH_PROJECT_MEMBERS:
      cellIdString = payload.cellIdString
      const members = payload.members as Array<WireRecord<Member>>
      const mapped = members.map((wireRecord) => wireRecord.entry)
      return {
        ...state,
        [cellIdString]: {
          ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }),
          members: _.keyBy(mapped, 'agentPubKey'),
        },
      }
    case SET_PROJECT_MEMBER:
      cellIdString = payload.cellIdString
      const member = payload.member as Member
      return {
        ...state,
        [cellIdString]: {
          ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }),
          members: {
            ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }).members,
            [member.agentPubKey]: member,
          },
        },
      }
    case FETCH_PROJECT_PROFILES:
      cellIdString = payload.cellIdString
      const profiles = payload.profiles as Array<Profile>
      return {
        ...state,
        [cellIdString]: {
          ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }),
          profiles,
        },
      }
    case SET_PROJECT_MEMBER_PROFILE:
      cellIdString = payload.cellIdString
      const profile = payload.profile as Profile
      return {
        ...state,
        [cellIdString]: {
          ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }),
          profiles: [
            ...(state[cellIdString] ? state[cellIdString] : { members: {}, profiles: [], whoami: null }).profiles.filter(
              (p) => p.agentPubKey !== profile.agentPubKey
            ),
            profile,
          ],
        },
      }

    // DEFAULT
    default:
      return state
  }
}
