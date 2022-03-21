import { createImportedProfile } from '../redux/persistent/profiles/agents/actions'
import { createOutcome } from '../redux/persistent/projects/outcomes/actions'
import { createConnection } from '../redux/persistent/projects/connections/actions'
import { createOutcomeComment } from '../redux/persistent/projects/outcome-comments/actions'
import { createOutcomeVote } from '../redux/persistent/projects/outcome-votes/actions'
import { createOutcomeMember } from '../redux/persistent/projects/outcome-members/actions'
import { createEntryPoint } from '../redux/persistent/projects/entry-points/actions'
import ProjectsZomeApi from '../api/projectsApi'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'

export default async function importAllProjectData(
  existingAgents,
  projectData,
  projectsCellIdString,
  profilesCellIdString,
  dispatch
) {
  /*
  agents, outcomes, connections,
  outcomeMembers, outcomeComments, outcomeVotes,
  entryPoints,
  */

  // AGENTS
  // first import the old agents
  // they must be imported through the profiles dna
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
  const profilesCellId = cellIdFromString(profilesCellIdString)
  const projectsCellId = cellIdFromString(projectsCellIdString)
  for (let address of Object.keys(projectData.agents)) {
    const old = projectData.agents[address]
    // only import agents that AREN'T already in your data store
    if (existingAgents[address]) {
      continue
    }
    const clone = {
      ...old,
      isImported: true,
    }
    const importedProfile = await profilesZomeApi.profile.createImportedProfile(profilesCellId, clone)
    await dispatch(
      createImportedProfile(profilesCellIdString, importedProfile)
    )
  }

  // OUTCOMES
  const outcomeAddressMap = {}
  // do the outcomes second, since pretty much everything else
  // is sub-data to the outcomes
  for (let outcomeAddress of Object.keys(projectData.outcomes)) {
    const oldOutcome = projectData.outcomes[outcomeAddress]
    const clone = {
      ...oldOutcome,
      isImported: true,
    }
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    let newOutcome
    try {
      // @ts-ignore
      const createdOutcome = await projectsZomeApi.outcome.create(projectsCellId, clone)
      newOutcome = await dispatch(
        createOutcome(projectsCellIdString, createdOutcome)
      )
    } catch (e) {
      console.log('createOutcome error', e)
      throw e
    }
    // add this new outcome address to the outcomeAddressMap
    // to keep of which new addresses map to which old addresses
    let oldOutcomeHeaderHash
    // v0.5.4-alpha
    if (oldOutcome.headerHash) oldOutcomeHeaderHash = oldOutcome.headerHash
    // pre v0.5.3-alpha and prior
    else if (oldOutcome.address) oldOutcomeHeaderHash = oldOutcome.address

    let newOutcomeHeaderHash
    // v0.5.4-alpha
    if (newOutcome.headerHash) newOutcomeHeaderHash = newOutcome.headerHash
    // pre v0.5.3-alpha and prior
    else if (newOutcome.address) newOutcomeHeaderHash = newOutcome.address

    outcomeAddressMap[oldOutcomeHeaderHash] = newOutcomeHeaderHash
  }

  // CONNECTIONS
  for (let address of Object.keys(projectData.connections)) {
    const old = projectData.connections[address]
    const clone = {
      ...old,
      parentAddress: outcomeAddressMap[old.parentAddress],
      childAddress: outcomeAddressMap[old.childAddress],
      // randomizer used to be a float, but is now an int
      randomizer: Number(old.randomizer.toFixed()),
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.childAddress || !clone.parentAddress) {
      console.log('weird, invalid connection:', clone)
      continue
    }
    try {
      // @ts-ignore
      const createdConnection = projectsZomeApi.connection.create(projectsCellId, clone)
      await dispatch(
        createConnection(projectsCellIdString, createdConnection)
      )
    } catch (e) {
      console.log('createConnection error', e)
      throw e
    }
  }

  // OUTCOME MEMBERS
  for (let address of Object.keys(projectData.outcomeMembers)) {
    const old = projectData.outcomeMembers[address]
    const clone = {
      ...old,
      outcomeAddress: outcomeAddressMap[old.outcomeAddress],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeAddress) {
      console.log('weird, invalid outcomeMember:', clone)
      continue
    }
    try {
      // @ts-ignore
      const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(projectsCellId, clone)
      await dispatch(
        createOutcomeMember(projectsCellIdString, createdOutcomeMember)
      )
    } catch (e) {
      console.log('createOutcomeMember error', e)
      throw e
    }
  }

  // OUTCOME COMMENTS
  for (let address of Object.keys(projectData.outcomeComments)) {
    const old = projectData.outcomeComments[address]
    const clone = {
      ...old,
      outcomeAddress: outcomeAddressMap[old.outcomeAddress],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeAddress) {
      console.log('weird, invalid outcomeComment:', clone)
      continue
    }
    try {
      // @ts-ignore
      const createdOutcomeComment = await projectsZomeApi.outcomeComment.create(projectsCellId, clone)
      await dispatch(
        createOutcomeComment(projectsCellIdString, createdOutcomeComment)
      )
    } catch (e) {
      console.log('createOutcomeComment error', e)
      throw e
    }
  }

  // OUTCOME VOTES
  for (let address of Object.keys(projectData.outcomeVotes)) {
    const old = projectData.outcomeVotes[address]
    const clone = {
      ...old,
      outcomeAddress: outcomeAddressMap[old.outcomeAddress],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeAddress) {
      console.log('weird, invalid outcomeVote:', clone)
      continue
    }
    try {
      // @ts-ignore
      const createdOutcomeVote = await projectsZomeApi.outcomeVote.create(projectsCellId, clone)
      await dispatch(
        createOutcomeVote(projectsCellIdString, createdOutcomeVote)
      )
    } catch (e) {
      console.log('createOutcomeVote error', e)
      throw e
    }
  }

  // ENTRY POINTS
  for (let address of Object.keys(projectData.entryPoints)) {
    const old = projectData.entryPoints[address]
    const clone = {
      ...old,
      outcomeAddress: outcomeAddressMap[old.outcomeAddress],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeAddress) {
      console.log('weird, invalid entryPoint:', clone)
      continue
    }
    try {
      // @ts-ignore
      const createdEntryPoint = await projectsZomeApi.entryPoint.create(projectsCellId, clone)
      await dispatch(
        createEntryPoint(projectsCellIdString, createdEntryPoint)
      )
    } catch (e) {
      console.log('createEntryPoint error', e)
      throw e
    }
  }

  // return the list of old addresses mapped to new addresses
  return outcomeAddressMap
}
