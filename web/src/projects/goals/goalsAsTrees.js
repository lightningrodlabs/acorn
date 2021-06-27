export default function goalsAsTrees(
  data,
  { withMembers = false, withComments = false, withVotes = false } = {}
) {
  const { goals, edges, goalMembers, goalVotes, goalComments, agents } = data

  // modify so that all goals have their related things, if in opts
  let allGoals = goals
  if (withComments || withMembers || withVotes) {
    const allGoalsArray = Object.values(goals).map(goal => {
      let extensions = {}
      if (withMembers) {
        extensions.members = Object.values(goalMembers)
          .filter(gm => gm.goal_address === goal.address)
          .map(gm => agents[gm.agent_address])
      }
      if (withComments) {
        extensions.comments = Object.values(goalComments).filter(
          gc => gc.goal_address === goal.address
        )
      }
      if (withVotes) {
        extensions.votes = Object.values(goalVotes).filter(
          gv => gv.goal_address === goal.address
        )
      }
      return {
        ...goal,
        ...extensions,
      }
    })
    allGoals = _.keyBy(allGoalsArray, 'address')
  }

  // CONSTRUCT TREES FOR THE INDENTED NAV TREE VIEW
  const edgesAsArray = Object.values(edges)
  const allGoalAddresses = Object.values(goals).map(goal => goal.address)
  // find the Goal objects without parent Goals
  // since they will sit at the top level
  const noParentsAddresses = allGoalAddresses.filter(goalAddress => {
    return !edgesAsArray.find(edge => edge.child_address === goalAddress)
  })
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Goal
  function getGoal(goalAddress) {
    return {
      ...allGoals[goalAddress],
      children: edgesAsArray
        // find the edges indicating the children of this goal
        .filter(edge => edge.parent_address === goalAddress)
        // actually nest the children Goals, recurse
        .map(edge => getGoal(edge.child_address)),
    }
  }
  // start with the root Goals, and recurse down to their children
  return noParentsAddresses.map(getGoal)
}
