import { createGoal } from '../projects/goals/actions'
import { createEdge } from '../projects/edges/actions'
import { createGoalComment } from '../projects/goal-comments/actions'
import { createGoalVote } from '../projects/goal-votes/actions'
import { createGoalMember } from '../projects/goal-members/actions'
import { createEntryPoint } from '../projects/entry-points/actions'

export default async function importAllProjectData(
  projectData,
  agentAddress,
  cellIdString,
  dispatch
) {
  /*
  agents,
  goals,
  edges,
  goalMembers,
  goalComments,
  goalVotes,
  entryPoints,
  */
  const goalAddressMap = {}
  // do the goals first, since pretty much everything else
  // is sub-data to the goals
  for (let goalAddress of Object.keys(projectData.goals)) {
    const oldGoal = projectData.goals[goalAddress]
    const clone = {
      ...oldGoal,
      // override the user related fields
      user_edit_hash: null,
      user_hash: agentAddress,
    }
    delete clone.address
    const newGoal = await dispatch(createGoal.create({ cellIdString, payload: clone }))
    // add this new goal address to the goalAddressMap
    // to keep of which new addresses map to which old addresses
    goalAddressMap[oldGoal.address] = newGoal.address
  }
  // do the rest

  
}
