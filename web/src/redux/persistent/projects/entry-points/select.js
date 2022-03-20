function selectActiveProjectMembers(state, projectId) {
  // if the agent is a member, grab the profile data
  // from the object containing that data (state.agents)
  const membersAsObject = state.projects.members[projectId]
  if (membersAsObject) {
    const projectMemberAddresses = Object.values(membersAsObject).map((member) => member.address)

    // convert from the member addresses, into the full member profile data
    // by picking from the state.agents object
    const profiles = projectMemberAddresses
      .map((address) => state.agents[address])
      // filter out undefined
      .filter((agentProfile) => agentProfile)
    return profiles
  } else {
    return []
  }
}

export {
  selectActiveProjectMembers
}

export default function selectEntryPoints(state, projectId) {
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const outcomes = state.projects.outcomes[projectId] || {}

  const combinedEntryPoints = Object.keys(entryPoints)
    .map(key => {
      const entryPoint = entryPoints[key]
      const outcome = outcomes[entryPoint.outcome_address]
      if (outcome) {
        return {
          ...entryPoint,
          content: outcome.content,
        }
      }
      return null
    })
    // filter out nulls
    .filter(e => e)

  return combinedEntryPoints
}
