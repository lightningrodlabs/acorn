import { createImportedProfile } from '../redux/persistent/profiles/agents/actions'
import { createGoal } from '../redux/persistent/projects/goals/actions'
import { createEdge } from '../redux/persistent/projects/edges/actions'
import { createGoalComment } from '../redux/persistent/projects/goal-comments/actions'
import { createGoalVote } from '../redux/persistent/projects/goal-votes/actions'
import { createGoalMember } from '../redux/persistent/projects/goal-members/actions'
import { createEntryPoint } from '../redux/persistent/projects/entry-points/actions'
import ProjectsZomeApi from '../api/projectsApi'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'

export default async function importAllProjectData(
  existingAgents,
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
  // TODO: convert profilesCellIdString into buffer
  // TODO: convert projectsCellIdString into buffer
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
  for (let address of Object.keys(projectData.agents)) {
    const old = projectData.agents[address]
    // only import agents that AREN'T already in your data store
    if (existingAgents[address]) {
      continue
    }
    const clone = {
      ...old,
      is_imported: true,
    }
    const importedProfile = await profilesZomeApi.profile.createImportedProfile(cellId, clone)
    await dispatch(
      createImportedProfile(profilesCellIdString, importedProfile)
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
      is_imported: true,
    }
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    let newGoal
    try {
      const createdOutcome = await projectsZomeApi.outcome.create(cellId, clone)
      newGoal = await dispatch(
        createGoal(projectsCellIdString, createdOutcome)
      )
    } catch (e) {
      console.log('createGoal error', e)
      throw e
    }
    // add this new goal address to the goalAddressMap
    // to keep of which new addresses map to which old addresses
    let oldGoalHeaderHash
    // v0.5.4-alpha
    if (oldGoal.headerHash) oldGoalHeaderHash = oldGoal.headerHash
    // pre v0.5.3-alpha and prior
    else if (oldGoal.address) oldGoalHeaderHash = oldGoal.address

    let newGoalHeaderHash
    // v0.5.4-alpha
    if (newGoal.headerHash) newGoalHeaderHash = newGoal.headerHash
    // pre v0.5.3-alpha and prior
    else if (newGoal.address) newGoalHeaderHash = newGoal.address

    goalAddressMap[oldGoalHeaderHash] = newGoalHeaderHash
  }

  // EDGES
  for (let address of Object.keys(projectData.edges)) {
    const old = projectData.edges[address]
    const clone = {
      ...old,
      parent_address: goalAddressMap[old.parent_address],
      child_address: goalAddressMap[old.child_address],
      // randomizer used to be a float, but is now an int
      randomizer: Number(old.randomizer.toFixed()),
      is_imported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.child_address || !clone.parent_address) {
      console.log('weird, invalid edge:', clone)
      continue
    }
    try {
      const createdConnection = projectsZomeApi.connection.create(cellId, clone)
      await dispatch(
        createEdge(projectsCellIdString, createdConnection)
      )
    } catch (e) {
      console.log('createEdge error', e)
      throw e
    }
  }

  // GOAL MEMBERS
  for (let address of Object.keys(projectData.goalMembers)) {
    const old = projectData.goalMembers[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
      is_imported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.goal_address) {
      console.log('weird, invalid goalMember:', clone)
      continue
    }
    try {
      const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(cellId, clone)
      await dispatch(
        createGoalMember(projectsCellIdString, createdOutcomeMember)
      )
    } catch (e) {
      console.log('createGoalMember error', e)
      throw e
    }
  }

  // GOAL COMMENTS
  for (let address of Object.keys(projectData.goalComments)) {
    const old = projectData.goalComments[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
      is_imported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.goal_address) {
      console.log('weird, invalid goalComment:', clone)
      continue
    }
    try {
      const createdOutcomeComment = await projectsZomeApi.outcomeComment.create(cellId, clone)
      await dispatch(
        createGoalComment(projectsCellIdString, createdOutcomeComment)
      )
    } catch (e) {
      console.log('createGoalComment error', e)
      throw e
    }
  }

  // GOAL VOTES
  for (let address of Object.keys(projectData.goalVotes)) {
    const old = projectData.goalVotes[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
      is_imported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.goal_address) {
      console.log('weird, invalid goalVote:', clone)
      continue
    }
    try {
      const createdOutcomeVote = await projectsZomeApi.outcomeVote.create(cellId, clone)
      await dispatch(
        createGoalVote(projectsCellIdString, createdOutcomeVote)
      )
    } catch (e) {
      console.log('createGoalVote error', e)
      throw e
    }
  }

  // ENTRY POINTS
  for (let address of Object.keys(projectData.entryPoints)) {
    const old = projectData.entryPoints[address]
    const clone = {
      ...old,
      goal_address: goalAddressMap[old.goal_address],
      is_imported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.goal_address) {
      console.log('weird, invalid entryPoint:', clone)
      continue
    }
    try {
      const createdEntryPoint = await projectsZomeApi.entryPoint.create(cellId, clone)
      await dispatch(
        createEntryPoint(projectsCellIdString, createdEntryPoint)
      )
    } catch (e) {
      console.log('createEntryPoint error', e)
      throw e
    }
  }

  // return the list of old addresses mapped to new addresses
  return goalAddressMap
}
