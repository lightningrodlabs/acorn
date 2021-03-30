import { createImportedProfile } from '../agents/actions'
import { createGoal } from '../projects/goals/actions'
import { createEdge } from '../projects/edges/actions'
import { createGoalComment } from '../projects/goal-comments/actions'
import { createGoalVote } from '../projects/goal-votes/actions'
import { createGoalMember } from '../projects/goal-members/actions'
import { createEntryPoint } from '../projects/entry-points/actions'

export default async function importAllProjectData(
  projectData,
  projectsCellIdString,
  profilesCellIdString,
  dispatch
) {
  /*
  agents, goals, edges,
  goalMembers, goalComments, goalVotes,
  entryPoints,
  */

  // AGENTS
  // first import the old agents
  // they must be imported through the profiles dna
  for (let address of Object.keys(projectData.agents)) {
    const old = projectData.agents[address]
    const clone = {
      ...old,
      is_imported: true,
    }
    await dispatch(
      createImportedProfile.create({
        cellIdString: profilesCellIdString,
        payload: clone,
      })
    )
  }

  // GOALS
  const goalAddressMap = {}
  // do the goals second, since pretty much everything else
  // is sub-data to the goals
  for (let goalAddress of Object.keys(projectData.goals)) {
    const oldGoal = projectData.goals[goalAddress]
    const clone = {
      ...oldGoal,
    }
    delete clone.address
    const newGoal = await dispatch(
      createGoal.create({ cellIdString: projectsCellIdString, payload: clone })
    )
    // add this new goal address to the goalAddressMap
    // to keep of which new addresses map to which old addresses
    goalAddressMap[oldGoal.address] = newGoal.address
  }
  
  // EDGES
  for (let address of Object.keys(projectData.edges)) {
    const old = projectData.edges[address]
    const clone = {
      ...old,
      parent_address: goalAddressMap[old.parent_address],
      child_address: goalAddressMap[old.child_address]
    }
    delete clone.address // an assigned field
    await dispatch(
      createEdge.create({
        cellIdString: projectsCellIdString,
        payload: clone,
      })
    )
  }

  // GOAL MEMBERS
  for (let address of Object.keys(projectData.goalMembers)) {
    const old = projectData.goalMembers[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
    }
    delete clone.address // an assigned field
    await dispatch(
      createGoalMember.create({
        cellIdString: projectsCellIdString,
        payload: clone,
      })
    )
  }

  // GOAL COMMENTS
  for (let address of Object.keys(projectData.goalComments)) {
    const old = projectData.goalComments[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
    }
    delete clone.address // an assigned field
    await dispatch(
      createGoalComment.create({
        cellIdString: projectsCellIdString,
        payload: clone,
      })
    )
  }

  // GOAL VOTES
  for (let address of Object.keys(projectData.goalVotes)) {
    const old = projectData.goalVotes[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
    }
    delete clone.address // an assigned field
    await dispatch(
      createGoalVote.create({
        cellIdString: projectsCellIdString,
        payload: clone,
      })
    )
  }

  // ENTRY POINTS
  for (let address of Object.keys(projectData.entryPoints)) {
    const old = projectData.entryPoints[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
    }
    delete clone.address // an assigned field
    await dispatch(
      createEntryPoint.create({
        cellIdString: projectsCellIdString,
        payload: clone,
      })
    )
  }
}
