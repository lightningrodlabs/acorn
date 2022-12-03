import { createImportedProfile } from '../redux/persistent/profiles/agents/actions'
import { createOutcome } from '../redux/persistent/projects/outcomes/actions'
import { createConnection } from '../redux/persistent/projects/connections/actions'
import { createOutcomeComment } from '../redux/persistent/projects/outcome-comments/actions'
import { createOutcomeMember } from '../redux/persistent/projects/outcome-members/actions'
import { createEntryPoint } from '../redux/persistent/projects/entry-points/actions'
import ProjectsZomeApi from '../api/projectsApi'
import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'
import { createTag } from '../redux/persistent/projects/tags/actions'
import { Outcome, ProjectMeta, Tag } from '../types'
import { WireRecord } from '../api/hdkCrud'
import { ActionHashB64, AgentPubKeyB64, CellIdString } from '../types/shared'
import { RootState } from '../redux/reducer'
import { AllProjectsDataExport, ProjectExportDataV1 } from './export'
import { createWhoami } from '../redux/persistent/profiles/who-am-i/actions'
import { setMember } from '../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { installProjectApp } from '../projects/installProjectApp'

export default async function importProjectsData(
  store: any,
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  const migrationDataParsed: AllProjectsDataExport = JSON.parse(migrationData)

  const initialState: RootState = store.getState()
  const myAgentPubKey = initialState.agentAddress

  const profilesCellIdString = initialState.cells.profiles
  const appWebsocket = await getAppWs()
  const profilesZomeApi = new ProfilesZomeApi(appWebsocket)
  const profilesCellId = cellIdFromString(profilesCellIdString)

  // prepare a list of only the NON-migrated projects to migrate
  const projectsToMigrate = migrationDataParsed.projects.filter((project) => {
    return !project.projectMeta.isMigrated
  })

  // count the number of steps this is going to take
  const totalSteps =
    1 + // the create personal profile step
    projectsToMigrate.length // the number of projects to import
  let stepsSoFar = 0

  // import active user's own profile
  const importedProfile = await profilesZomeApi.profile.createWhoami(
    profilesCellId,
    migrationDataParsed.myProfile
  )
  await store.dispatch(createWhoami(profilesCellIdString, importedProfile))
  stepsSoFar++
  onStep(stepsSoFar, totalSteps)

  // import each individual project, notifying of progress after each
  // one completes
  for await (let projectData of projectsToMigrate) {
    const passphrase = projectData.projectMeta.passphrase
    await installProjectAppAndImport(
      myAgentPubKey,
      projectData,
      passphrase,
      store.dispatch
    )
    stepsSoFar++
    onStep(stepsSoFar, totalSteps)
  }
}

export async function installProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any
) {
  // first step is to install the dna
  const [projectsCellIdString] = await installProjectApp(passphrase)
  const cellId = cellIdFromString(projectsCellIdString)
  // next step is to import the rest of the data into that project
  const oldToNewAddressMap = await importProjectData(
    projectData,
    projectsCellIdString,
    dispatch
  )

  // only add the project meta after the rest has been imported
  // so it doesn't list itself early in the process
  // first step is to create new project
  const originalTopPriorityOutcomes =
    projectData.projectMeta.topPriorityOutcomes
  const projectMeta: ProjectMeta = {
    ...projectData.projectMeta,
    // the question mark operator for backwards compatibility
    topPriorityOutcomes: originalTopPriorityOutcomes
      ? originalTopPriorityOutcomes
          .map((oldAddress) => oldToNewAddressMap[oldAddress])
          .filter((address) => address)
      : [],
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase: passphrase,
    isMigrated: null,
  }
  // these are not actual fields
  // v0.5.4-alpha
  // @ts-ignore
  delete projectMeta.actionHash
  // pre v0.5.3-alpha and prior
  // @ts-ignore
  delete projectMeta.address

  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await dispatch(setMember(projectsCellIdString, { agentPubKey: agentAddress }))
  try {
    const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
      cellId,
      projectMeta
    )
    await dispatch(
      simpleCreateProjectMeta(projectsCellIdString, simpleCreatedProjectMeta)
    )
  } catch (e) {
    throw e
  }
}

export async function importProjectData(
  projectData: ProjectExportDataV1,
  projectsCellIdString: CellIdString,
  dispatch: any
) {
  /*
  outcomes, connections,
  outcomeMembers, outcomeComments,
  entryPoints, tags
  */

  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  const projectsCellId = cellIdFromString(projectsCellIdString)

  // Strategy: do things with no data references first

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

    outcomeActionHashMap[oldOutcomeActionHash] = newOutcome.actionHash
  }

  // CONNECTIONS
  for (let address of Object.keys(projectData.connections)) {
    const old = projectData.connections[address]
    // v1.0.4-alpha: parentActionHash
    const newParentOutcomeActionHash =
      outcomeActionHashMap[old.parentActionHash]
    // v1.0.4-alpha: childActionHash
    const newChildOutcomeActionHash = outcomeActionHashMap[old.childActionHash]
    const clone = {
      ...old,
      parentActionHash: newParentOutcomeActionHash,
      childActionHash: newChildOutcomeActionHash,
      // randomizer used to be a float, but is now an int
      randomizer: Number(old.randomizer.toFixed()),
      isImported: true,
    }
    // an assigned field
    // as of v1.0.4-alpha
    delete clone.actionHash

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
    const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // an assigned field
    // as of v1.0.4-alpha
    delete clone.actionHash

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
    const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash

    if (!clone.outcomeActionHash) {
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

  // ENTRY POINTS
  for (let address of Object.keys(projectData.entryPoints)) {
    const old = projectData.entryPoints[address]
    // v1.0.4-alpha: outcomeActionHash
    const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]
    const clone = {
      ...old,
      outcomeActionHash: newOutcomeActionHash,
      isImported: true,
    }
    // an assigned field
    // v1.0.4-alpha
    delete clone.actionHash

    if (!clone.outcomeActionHash) {
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
