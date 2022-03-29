/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { WireElement } from "../../../../api/hdkCrud"
import { Member } from "../../../../types"
import { Action, CellIdString } from "../../../../types/shared"


// SET because it could be brand new, or an update, but treat it the same way
const SET_MEMBER = 'SET_MEMBER'
const FETCH_MEMBERS = 'FETCH_MEMBERS'

/* action creator functions */

const setMember = (cellIdString: CellIdString, member: Member): Action<{cellIdString: CellIdString, member: Member}> => {
  return {
    type: SET_MEMBER,
    payload: {
      cellIdString,
      member,
    },
  }
}

const fetchMembers = (cellIdString: CellIdString, payload: Array<WireElement<Member>>): Action<Array<WireElement<Member>>> => {
  return {
    type: FETCH_MEMBERS,
    payload,
    meta: { cellIdString }
  }
}
export { SET_MEMBER, FETCH_MEMBERS, setMember, fetchMembers }
