import { CellIdString } from '../../../../types/shared'
import { RootState } from '../../../reducer'

function selectActiveProjectMembers(state: RootState, projectId: CellIdString) {
  // if the agent is a member, grab the profile data
  // from the object containing that data (state.agents)
  const membersAsObject = state.projects.members[projectId]
  if (membersAsObject) {
    const projectMemberAgentPubKeys = Object.values(membersAsObject).map(
      (member) => member.agentPubKey
    )

    // convert from the member agent pub keys, into the full member profile data
    // by picking from the state.agents object
    const profiles = projectMemberAgentPubKeys
      .map((agentPubKey) => state.agents[agentPubKey])
      // filter out undefined
      .filter((agentProfile) => agentProfile)
    return profiles
  } else {
    return []
  }
}

export { selectActiveProjectMembers }

export default function selectEntryPoints(state, projectId) {
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const outcomes = state.projects.outcomes[projectId] || {}

  const combinedEntryPoints = Object.keys(entryPoints)
    .map((key) => {
      const entryPoint = entryPoints[key]
      const outcome = outcomes[entryPoint.outcomeHeaderHash]
      if (outcome) {
        return {
          ...entryPoint,
          content: outcome.content,
        }
      }
      return null
    })
    // filter out nulls
    .filter((e) => e)

  return combinedEntryPoints
}
