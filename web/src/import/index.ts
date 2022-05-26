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
import { createTag } from '../redux/persistent/projects/tags/actions'
import { Outcome } from '../types'
import { WireElement } from '../api/hdkCrud'
import { HeaderHashB64 } from '../types/shared'

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
  entryPoints, tags
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
  const outcomeHeaderHashMap: { [oldHeaderHash: HeaderHashB64]: HeaderHashB64 } = {}
  // do the outcomes second, since pretty much everything else
  // is sub-data to the outcomes
  for (let outcomeHeaderHash of Object.keys(projectData.outcomes)) {
    const oldOutcome = projectData.outcomes[outcomeHeaderHash]
    const clone = {
      ...oldOutcome,
      isImported: true,
    }
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    let newOutcome: WireElement<Outcome>
    try {
      newOutcome = await projectsZomeApi.outcome.create(projectsCellId, clone)
      dispatch(
        createOutcome(projectsCellIdString, newOutcome)
      )
    } catch (e) {
      console.log('createOutcome error', e)
      throw e
    }
    // add this new outcome address to the outcomeHeaderHashMap
    // to keep of which new addresses map to which old addresses
    let oldOutcomeHeaderHash: HeaderHashB64
    // v0.5.4-alpha
    if (oldOutcome.headerHash) oldOutcomeHeaderHash = oldOutcome.headerHash
    // pre v0.5.3-alpha and prior
    else if (oldOutcome.address) oldOutcomeHeaderHash = oldOutcome.address

    outcomeHeaderHashMap[oldOutcomeHeaderHash] = newOutcome.headerHash
  }

  // CONNECTIONS
  for (let address of Object.keys(projectData.connections)) {
    const old = projectData.connections[address]
    console.log(old)
    const clone = {
      ...old,
      parentHeaderHash: outcomeHeaderHashMap[old.parentHeaderHash],
      childHeaderHash: outcomeHeaderHashMap[old.childHeaderHash],
      // randomizer used to be a float, but is now an int
      randomizer: Number(old.randomizer.toFixed()),
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.childHeaderHash || !clone.parentHeaderHash) {
      console.log('weird, invalid connection:', clone)
      continue
    }
    try {
      const createdConnection = await projectsZomeApi.connection.create(projectsCellId, clone)
      dispatch(
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
      outcomeHeaderHash: outcomeHeaderHashMap[old.outcomeHeaderHash],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeHeaderHash) {
      console.log('weird, invalid outcomeMember:', clone)
      continue
    }
    try {
      const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(projectsCellId, clone)
      dispatch(
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
      outcomeHeaderHash: outcomeHeaderHashMap[old.outcomeHeaderHash],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeHeaderHash) {
      console.log('weird, invalid outcomeComment:', clone)
      continue
    }
    try {
      const createdOutcomeComment = await projectsZomeApi.outcomeComment.create(projectsCellId, clone)
      dispatch(
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
      outcomeHeaderHash: outcomeHeaderHashMap[old.outcomeHeaderHash],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeHeaderHash) {
      console.log('weird, invalid outcomeVote:', clone)
      continue
    }
    try {
      const createdOutcomeVote = await projectsZomeApi.outcomeVote.create(projectsCellId, clone)
      dispatch(
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
      outcomeHeaderHash: outcomeHeaderHashMap[old.outcomeHeaderHash],
      isImported: true,
    }
    // an assigned field
    // v0.5.4-alpha
    delete clone.headerHash
    // pre v0.5.3-alpha and prior
    delete clone.address

    if (!clone.outcomeHeaderHash) {
      console.log('weird, invalid entryPoint:', clone)
      continue
    }
    try {
      const createdEntryPoint = await projectsZomeApi.entryPoint.create(projectsCellId, clone)
      dispatch(
        createEntryPoint(projectsCellIdString, createdEntryPoint)
      )
    } catch (e) {
      console.log('createEntryPoint error', e)
      throw e
    }
  }

  // TAGS
  // only v1.0.0-alpha and beyond have tags
  if (projectData.tags) {
    for (let address of Object.keys(projectData.tags)) {
      const old = projectData.tags[address]
      const clone = {
        ...old,
      }
      // an assigned field
      // v1.0.0-alpha
      delete clone.headerHash

      try {
        const createdTag = await projectsZomeApi.tag.create(projectsCellId, clone)
        dispatch(
          createTag(projectsCellIdString, createdTag)
        )
      } catch (e) {
        console.log('createTag error', e)
        throw e
      }
    }
  }

  // return the list of old addresses mapped to new addresses
  return outcomeHeaderHashMap
}
