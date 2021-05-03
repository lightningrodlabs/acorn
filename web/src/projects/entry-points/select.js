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
