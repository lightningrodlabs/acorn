/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/


// SET because it could be brand new, or an update, but treat it the same way
const SET_MEMBER = 'SET_MEMBER'
const FETCH_MEMBERS = 'FETCH_MEMBERS'

/* action creator functions */

const setMember = (cellIdString, member) => {
  return {
    type: SET_MEMBER,
    payload: {
      cellIdString,
      member,
    },
  }
}

const fetchMembers = (cellIdString, payload) => {
  return {
    type: FETCH_MEMBERS,
    payload,
    meta: { cellIdString }
  }
}
export { SET_MEMBER, FETCH_MEMBERS, setMember, fetchMembers }
