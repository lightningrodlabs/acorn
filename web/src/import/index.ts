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
import { Outcome, Tag } from '../types'
import { WireRecord } from '../api/hdkCrud'
import { ActionHashB64 } from '../types/shared'

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
    const importedProfile = await profilesZomeApi.profile.createImportedProfile(
      profilesCellId,
      clone
    )
    await dispatch(createImportedProfile(profilesCellIdString, importedProfile))
  }

  // do things with no data references first

  // TAGS
  // do tags because outcomes reference them
  const tagActionHashMap: {
    [oldActionHash: ActionHashB64]: ActionHashB64
  } = {}
  // TAGS
  // only v1.0.0-alpha and beyond have tags
  for (let address of Object.keys(projectData.tags)) {
    const old = projectData.tags[address]
    const clone = {
      ...old,
    }
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash
    // v1.0.0-alpha
    delete clone.headerHash

    let newTag: WireRecord<Tag>
    try {
      newTag = await projectsZomeApi.tag.create(projectsCellId, clone)
      dispatch(createTag(projectsCellIdString, newTag))
    } catch (e) {
      console.log('createTag error', e)
      throw e
    }

    // add this new tag address to the tagActionHashMap
    // to keep of which new addresses map to which old addresses
    let oldTagActionHash: ActionHashB64
    // as of v1.0.4-alpha
    if (old.actionHash) oldTagActionHash = old.actionHash
    // pre 1.0.4-alpha (1.x series)
    else if (old.headerHash) oldTagActionHash = old.headerHash

    tagActionHashMap[oldTagActionHash] = newTag.actionHash
  }

  // OUTCOMES
  const outcomeActionHashMap: {
    [oldActionHash: ActionHashB64]: ActionHashB64
  } = {}
  // do the outcomes third, since pretty much everything else
  // is sub-data to the outcomes
  for (let outcomeActionHash of Object.keys(projectData.outcomes)) {
    const oldOutcome = projectData.outcomes[outcomeActionHash]
    const clone = {
      ...oldOutcome,
      // make sure tag references hold up through the migration
      tags: oldOutcome.tags.map(
        (oldTagHash: ActionHashB64) => tagActionHashMap[oldTagHash]
      ),
      isImported: true,
    }
    // as of v1.0.4-alpha
    delete clone.actionHash
    // as of v0.5.4-alpha
    delete clone.headerHash

    let newOutcome: WireRecord<Outcome>
    try {
      newOutcome = await projectsZomeApi.outcome.create(projectsCellId, clone)
      dispatch(createOutcome(projectsCellIdString, newOutcome))
    } catch (e) {
      console.log('createOutcome error', e)
      throw e
    }
    // add this new outcome address to the outcomeActionHashMap
    // to keep of which new addresses map to which old addresses
    let oldOutcomeActionHash: ActionHashB64
    // as of v1.0.4-alpha
    if (oldOutcome.actionHash) oldOutcomeActionHash = oldOutcome.actionHash
    // as of v0.5.4-alpha
    if (oldOutcome.headerHash) oldOutcomeActionHash = oldOutcome.headerHash
    else if (oldOutcome.address) oldOutcomeActionHash = oldOutcome.address

    outcomeActionHashMap[oldOutcomeActionHash] = newOutcome.actionHash
  }

  // CONNECTIONS
  for (let address of Object.keys(projectData.connections)) {
    const old = projectData.connections[address]
    // v1.0.4-alpha: parentActionHash
    // v1.0.3-alpha and prior: parentHeaderHash
    const newParentOutcomeActionHash = old.parentHeaderHash
      ? outcomeActionHashMap[old.parentHeaderHash]
      : outcomeActionHashMap[old.parentActionHash]
    // v1.0.4-alpha: childActionHash
    // v1.0.3-alpha and prior: childHeaderHash
    const newChildOutcomeActionHash = old.childHeaderHash
      ? outcomeActionHashMap[old.childHeaderHash]
      : outcomeActionHashMap[old.childActionHash]
    const clone = {
      ...old,
      parentActionHash: newParentOutcomeActionHash,
      childActionHash: newChildOutcomeActionHash,
      // randomizer used to be a float, but is now an int
      randomizer: Number(old.randomizer.toFixed()),
      isImported: true,
    }
    // pre v1.0.4-alpha
    delete clone.parentHeaderHash
    delete clone.childHeaderHash
    // an assigned field
    // as of v1.0.4-alpha
    delete clone.actionHash
    // v0.5.4-alpha
    delete clone.headerHash

    if (!clone.childActionHash || !clone.parentActionHash) {
      console.log('weird, invalid connection:', clone)
      continue
    }
    try {
      const createdConnection = await projectsZomeApi.connection.create(
        projectsCellId,
        clone
      )
      dispatch(createConnection(projectsCellIdString, createdConnection))
    } catch (e) {
      console.log('createConnection error', e)
      throw e
    }
  }

  // OUTCOME MEMBERS
  for (let address of Object.keys(projectData.outcomeMembers)) {
    const old = projectData.outcomeMembers[address]
    // v1.0.4-alpha: outcomeActionHash
    // v1.0.3-alpha and prior: outcomeHeaderHash
    const newOutcomeActionHash = old.outcomeHeaderHash
      ? outcomeActionHashMap[old.outcomeHeaderHash]
      : outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // pre v1.0.4-alpha
    delete clone.outcomeHeaderHash
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash
    // v0.5.4-alpha
    delete clone.headerHash

    if (!clone.outcomeActionHash) {
      console.log('weird, invalid outcomeMember:', clone)
      continue
    }
    try {
      const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(
        projectsCellId,
        clone
      )
      dispatch(createOutcomeMember(projectsCellIdString, createdOutcomeMember))
    } catch (e) {
      console.log('createOutcomeMember error', e)
      throw e
    }
  }

  // OUTCOME COMMENTS
  for (let address of Object.keys(projectData.outcomeComments)) {
    const old = projectData.outcomeComments[address]
    // v1.0.4-alpha: outcomeActionHash
    // v1.0.3-alpha and prior: outcomeHeaderHash
    const newOutcomeActionHash = old.outcomeHeaderHash
      ? outcomeActionHashMap[old.outcomeHeaderHash]
      : outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // pre v1.0.4-alpha
    delete clone.outcomeHeaderHash
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash
    // v0.5.4-alpha
    delete clone.headerHash

    if (!clone.outcomeActionHash && !clone.outcomeHeaderHash) {
      console.log('weird, invalid outcomeComment:', clone)
      continue
    }
    try {
      const createdOutcomeComment = await projectsZomeApi.outcomeComment.create(
        projectsCellId,
        clone
      )
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
    // v1.0.4-alpha: outcomeActionHash
    // v1.0.3-alpha and prior: outcomeHeaderHash
    const newOutcomeActionHash = old.outcomeHeaderHash
      ? outcomeActionHashMap[old.outcomeHeaderHash]
      : outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // pre v1.0.4-alpha
    delete clone.outcomeHeaderHash
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash
    // v0.5.4-alpha
    delete clone.headerHash

    if (!clone.outcomeActionHash && !clone.outcomeHeaderHash) {
      console.log('weird, invalid outcomeVote:', clone)
      continue
    }
    try {
      const createdOutcomeVote = await projectsZomeApi.outcomeVote.create(
        projectsCellId,
        clone
      )
      dispatch(createOutcomeVote(projectsCellIdString, createdOutcomeVote))
    } catch (e) {
      console.log('createOutcomeVote error', e)
      throw e
    }
  }

  // ENTRY POINTS
  for (let address of Object.keys(projectData.entryPoints)) {
    const old = projectData.entryPoints[address]
    // v1.0.4-alpha: outcomeActionHash
    // v1.0.3-alpha and prior: outcomeHeaderHash
    const newOutcomeActionHash = old.outcomeHeaderHash
      ? outcomeActionHashMap[old.outcomeHeaderHash]
      : outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // pre v1.0.4-alpha
    delete clone.outcomeHeaderHash
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash
    // v0.5.4-alpha
    delete clone.headerHash

    if (!clone.outcomeActionHash && !clone.outcomeHeaderHash) {
      console.log('weird, invalid entryPoint:', clone)
      continue
    }
    try {
      const createdEntryPoint = await projectsZomeApi.entryPoint.create(
        projectsCellId,
        clone
      )
      dispatch(createEntryPoint(projectsCellIdString, createdEntryPoint))
    } catch (e) {
      console.log('createEntryPoint error', e)
      throw e
    }
  }

  // return the list of old addresses mapped to new addresses
  return outcomeActionHashMap
}
