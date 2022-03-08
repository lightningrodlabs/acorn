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
  const goals = state.projects.goals[projectId] || {}

  const combinedEntryPoints = Object.keys(entryPoints)
    .map(key => {
      const entryPoint = entryPoints[key]
      const goal = goals[entryPoint.goal_address]
      if (goal) {
        return {
          ...entryPoint,
          content: goal.content,
        }
      }
      return null
    })
    // filter out nulls
    .filter(e => e)

  return combinedEntryPoints
}
