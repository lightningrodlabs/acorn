
import _ from 'lodash'

import { SET_MEMBER, fetchMembers } from './actions'

const defaultState = {}

export default function (state = defaultState, action) {
  const { payload, type } = action

  let cellIdString
  switch (type) {
    // FETCH_MEMBERS
    case fetchMembers.success().type:
      cellIdString = action.meta.cellIdString
      return {
        ...state,
        [cellIdString]: _.keyBy(payload, 'address'),
      }
    // SET_MEMBER
    case SET_MEMBER:
      cellIdString = payload.cellIdString
      return {
        ...state,
        [cellIdString]: {
          ...state[cellIdString],
          [payload.member.address]: payload.member,
        },
      }
    // DEFAULT
    default:
      return state
  }
}
