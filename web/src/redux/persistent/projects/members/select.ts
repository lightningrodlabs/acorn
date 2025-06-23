import { Profile } from 'zod-models'
import { RootState } from '../../../reducer'
import { AgentPubKeyB64, CellIdString } from '../../../../types/shared'

export function selectMemberProfilesOfProject(
  state: RootState,
  projectId: CellIdString
): Profile[] {
  // if the agent is a member, grab the profile data
  // from the object containing that data (state.agents)
  const membersAsObject = state.projects.members[projectId]
  if (membersAsObject) {
    return membersAsObject.profiles.filter((profile) =>
      Object.keys(membersAsObject.members).includes(profile.agentPubKey)
    )
  } else {
    return []
  }
}


export function selectProjectMemberPukeys(
  state: RootState,
  projectId: CellIdString
): AgentPubKeyB64[] {
  // if the agent is a member, grab the profile data
  // from the object containing that data (state.agents)
  const membersAsObject = state.projects.members[projectId]
  if (membersAsObject) {
    return Object.keys(membersAsObject.members)
  } else {
    return []
  }
}

