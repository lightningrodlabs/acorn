/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/

import { WireRecord } from '../../../../api/hdkCrud'
import { Member, Profile } from '../../../../types'
import { Action, CellIdString } from '../../../../types/shared'

// SET because it could be brand new, or an update, but treat it the same way
const SET_PROJECT_MEMBER = 'SET_PROJECT_MEMBER'
const FETCH_PROJECT_MEMBERS = 'FETCH_PROJECT_MEMBERS'
const FETCH_PROJECT_PROFILES = 'FETCH_PROJECT_PROFILES'
const SET_PROJECT_MEMBER_PROFILE = 'SET_PROJECT_MEMBER_PROFILE'
const SET_PROJECT_WHOAMI = 'SET_PROJECT_WHOAMI'

/* action creator functions */

const setProjectWhoami = (
  cellIdString: CellIdString,
  whoami: WireRecord<Profile>
): Action<{ cellIdString: CellIdString; whoami: WireRecord<Profile> }> => {
  return {
    type: SET_PROJECT_WHOAMI,
    payload: {
      cellIdString,
      whoami,
    },
  }
}

const setProjectMember = (
  cellIdString: CellIdString,
  member: Member
): Action<{ cellIdString: CellIdString; member: Member }> => {
  return {
    type: SET_PROJECT_MEMBER,
    payload: {
      cellIdString,
      member,
    },
  }
}

const fetchProjectMembers = (
  cellIdString: CellIdString,
  members: Array<WireRecord<Member>>
): Action<{
  cellIdString: CellIdString
  members: Array<WireRecord<Member>>
}> => {
  return {
    type: FETCH_PROJECT_MEMBERS,
    payload: {
      cellIdString,
      members,
    },
  }
}

const fetchProjectProfiles = (
  cellIdString: CellIdString,
  profiles: Array<Profile>
): Action<{ cellIdString: CellIdString; profiles: Array<Profile> }> => {
  return {
    type: FETCH_PROJECT_PROFILES,
    payload: {
      cellIdString,
      profiles,
    },
  }
}

const setProjectMemberProfile = (
  cellIdString: CellIdString,
  profile: Profile
): Action<{ cellIdString: CellIdString; profile: Profile }> => {
  return {
    type: SET_PROJECT_MEMBER_PROFILE,
    payload: {
      cellIdString,
      profile: profile,
    },
  }
}

export {
  SET_PROJECT_WHOAMI,
  SET_PROJECT_MEMBER,
  FETCH_PROJECT_MEMBERS,
  FETCH_PROJECT_PROFILES,
  SET_PROJECT_MEMBER_PROFILE,
  setProjectMember,
  fetchProjectMembers,
  fetchProjectProfiles,
  setProjectMemberProfile,
  setProjectWhoami,
}
