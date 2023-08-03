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
import {
  Connection,
  EntryPoint,
  LayeringAlgorithm,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  ProjectMeta,
  Tag,
} from '../types'
import { WireRecord } from '../api/hdkCrud'
import {
  Action,
  ActionHashB64,
  AgentPubKeyB64,
  CellIdString,
  WithActionHash,
} from '../types/shared'
import { RootState } from '../redux/reducer'
import { AllProjectsDataExport, ProjectExportDataV1 } from './export'
import { createWhoami } from '../redux/persistent/profiles/who-am-i/actions'
import { setMember } from '../redux/persistent/projects/members/actions'
import { simpleCreateProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { installProjectApp } from '../projects/installProjectApp'
import { joinProjectCellId } from '../redux/persistent/cells/actions'
import { AppWebsocket, CellId } from '@holochain/client'

export async function internalImportProjectsData(
  // dependent functions
  _getAppWs: typeof getAppWs,
  _createProfilesZomeApi: typeof createProfilesZomeApi,
  _createProjectsZomeApi: typeof createProjectsZomeApi,
  _installProjectAppAndImport: typeof installProjectAppAndImport,
  _installProjectApp: typeof installProjectApp,
  store: any,
  // main input data and callbacks
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  const migrationDataParsed: AllProjectsDataExport = JSON.parse(migrationData)

  const initialState: RootState = store.getState()
  const myAgentPubKey = initialState.agentAddress

  const profilesCellIdString = initialState.cells.profiles
  const appWebsocket = await _getAppWs()
  const profilesZomeApi = _createProfilesZomeApi(appWebsocket)
  const projectsZomeApi = _createProjectsZomeApi(appWebsocket)
  const profilesCellId = cellIdFromString(profilesCellIdString)

  // prepare a list of only the NON-migrated projects to migrate
  const projectsToMigrate = migrationDataParsed.projects.filter((project) => {
    return !project.projectMeta.isMigrated
  })

  const migratedProjectsToJoin = migrationDataParsed.projects.filter(
    (project) => {
      return project.projectMeta.isMigrated
    }
  )

  // count the number of steps this is going to take
  const totalSteps =
    1 + // the create personal profile step
    projectsToMigrate.length + // the number of projects to import
    migratedProjectsToJoin.length // the number of projects to join
  let stepsSoFar = 0

  // import active user's own profile
  const importedProfile = await profilesZomeApi.profile.createWhoami(
    profilesCellId,
    migrationDataParsed.myProfile
  )
  store.dispatch(createWhoami(profilesCellIdString, importedProfile))
  stepsSoFar++
  onStep(stepsSoFar, totalSteps)

  // import each individual project, notifying of progress after each
  // one completes
  for await (let projectData of projectsToMigrate) {
    const passphrase = projectData.projectMeta.passphrase
    await _installProjectAppAndImport(
      myAgentPubKey,
      projectData,
      passphrase,
      store.dispatch,
      projectsZomeApi
    )
    stepsSoFar++
    onStep(stepsSoFar, totalSteps)
  }

  // join each project that has already been migrated by a peer
  for await (let projectData of migratedProjectsToJoin) {
    const passphrase = projectData.projectMeta.passphrase
    const [cellIdString, _, __] = await _installProjectApp(passphrase)
    store.dispatch(joinProjectCellId(cellIdString))
    stepsSoFar++
    onStep(stepsSoFar, totalSteps)
  }
}

export function createProfilesZomeApi(
  appWebsocket: AppWebsocket
): ProfilesZomeApi {
  return new ProfilesZomeApi(appWebsocket)
}
export function createProjectsZomeApi(
  appWebsocket: AppWebsocket
): ProjectsZomeApi {
  return new ProjectsZomeApi(appWebsocket)
}

export default async function importProjectsData(
  store: any,
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  await internalImportProjectsData(
    getAppWs,
    createProfilesZomeApi,
    createProjectsZomeApi,
    installProjectAppAndImport,
    installProjectApp,
    store,
    migrationData,
    onStep
  )
}

export async function internalInstallProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  _installProjectApp: typeof installProjectApp,
  _importProjectData: typeof importProjectData,
  projectsZomeApi: ProjectsZomeApi
) {
  // first step is to install the dna
  const [projectsCellIdString] = await _installProjectApp(passphrase)
  const cellId = cellIdFromString(projectsCellIdString)
  // next step is to import the rest of the data into that project
  const oldToNewAddressMap = await _importProjectData(
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
    // add a fallback layering algorithm in case the project has none
    layeringAlgorithm: projectData.projectMeta.layeringAlgorithm
      ? projectData.projectMeta.layeringAlgorithm
      : LayeringAlgorithm.LongestPath,
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase: passphrase,
    isMigrated: null,
  }
  // v0.5.4-alpha
  // not an actual field in the backend
  // needed to type-convert to any so typescript doesn't complain
  delete (projectMeta as any).actionHash

  dispatch(setMember(projectsCellIdString, { agentPubKey: agentAddress }))

  const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )

  dispatch(
    simpleCreateProjectMeta(projectsCellIdString, simpleCreatedProjectMeta)
  )
}

export async function installProjectAppAndImport(
  agentAddress: AgentPubKeyB64,
  projectData: ProjectExportDataV1,
  passphrase: string,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi
) {
  internalInstallProjectAppAndImport(
    agentAddress,
    projectData,
    passphrase,
    dispatch,
    installProjectApp,
    importProjectData,
    projectsZomeApi
  )
}

export type ActionHashMap = { [oldActionHash: ActionHashB64]: ActionHashB64 }

/*
  This function is an abstracted function
  that can be used for any set of data (dataSet)
  that should be written again to the DHT,
  and the new actionHashes for the data (mapped)
*/
export async function cloneDataSet<T>(
  dataSet: { [actionHash: string]: WithActionHash<T> },
  cloneFn: (old: WithActionHash<T>) => WithActionHash<T>,
  zomeCallFn: (cellId: CellId, obj: T) => Promise<WireRecord<T>>,
  actionCreatorFn: (
    cellIdString: CellIdString,
    obj: WireRecord<T>
  ) => Action<WireRecord<T>>,
  dispatch: any,
  projectsCellIdString: CellIdString
) {
  const newActionHashMap: ActionHashMap = {}

  for (let address of Object.keys(dataSet)) {
    const old = dataSet[address]
    // NOTE: cloneFn should do a deep copy
    // not just return the reference
    const clone = cloneFn(old)
    delete clone.actionHash

    let newObj: WireRecord<T>
    try {
      newObj = await zomeCallFn(cellIdFromString(projectsCellIdString), clone)
      dispatch(actionCreatorFn(projectsCellIdString, newObj))
    } catch (e) {
      console.log(`create obj error`, e)
      throw e
    }

    let oldActionHash: ActionHashB64
    if (old.actionHash) oldActionHash = old.actionHash
    // TODO: fix how oldActionHash could be undefined, what
    // should we do?
    newActionHashMap[oldActionHash] = newObj.actionHash
  }
  return newActionHashMap
}

export const cloneTag = (old: WithActionHash<Tag>): WithActionHash<Tag> => {
  return {
    ...old,
  }
}

export const cloneOutcome = (tagActionHashMap: ActionHashMap) => (
  old: WithActionHash<Outcome>
): WithActionHash<Outcome> => {
  return {
    ...old,
    // make sure tag references hold up through the migration
    tags: old.tags.map(
      (oldTagHash: ActionHashB64) => tagActionHashMap[oldTagHash]
    ),
    isImported: true,
  }
}

export const cloneConnection = (outcomeActionHashMap: ActionHashMap) => (
  old: WithActionHash<Connection>
): WithActionHash<Connection> => {
  const newParentOutcomeActionHash = outcomeActionHashMap[old.parentActionHash]
  // v1.0.4-alpha: childActionHash
  const newChildOutcomeActionHash = outcomeActionHashMap[old.childActionHash]

  return {
    ...old,
    parentActionHash: newParentOutcomeActionHash,
    childActionHash: newChildOutcomeActionHash,
    // randomizer used to be a float, but is now an int
    randomizer: Number(old.randomizer.toFixed()),
    isImported: true,
  }
}

export const cloneData = <T extends { outcomeActionHash: ActionHashB64 }>(
  outcomeActionHashMap: ActionHashMap
) => (old: WithActionHash<T>): WithActionHash<T> => {
  const newOutcomeActionHash = outcomeActionHashMap[old.outcomeActionHash]

  return {
    ...old,
    outcomeActionHash: newOutcomeActionHash,
    isImported: true,
  }
}

export async function internalImportProjectData(
  projectData: ProjectExportDataV1,
  projectsCellIdString: CellIdString,
  dispatch: any,
  _getAppWs: typeof getAppWs,
  _createProjectsZomeApi: typeof createProjectsZomeApi,
  _cloneDataSet: typeof cloneDataSet
) {
  /*
  outcomes, connections,
  outcomeMembers, outcomeComments,
  entryPoints, tags
  */

  const appWebsocket = await _getAppWs()
  const projectsZomeApi = _createProjectsZomeApi(appWebsocket)

  // Strategy: do things with no data references first

  // TAGS
  // do tags because outcomes reference them
  const tagActionHashMap = await _cloneDataSet<Tag>(
    projectData.tags,
    cloneTag,
    projectsZomeApi.tag.create,
    createTag,
    dispatch,
    projectsCellIdString
  )

  const outcomeActionHashMap = await _cloneDataSet<Outcome>(
    projectData.outcomes,
    // closure in the depended upon hashmap
    cloneOutcome(tagActionHashMap),
    projectsZomeApi.outcome.create,
    createOutcome,
    dispatch,
    projectsCellIdString
  )

  const connectionsActionHashMap = await _cloneDataSet<Connection>(
    projectData.connections,
    // closure in the depended upon
    cloneConnection(outcomeActionHashMap),
    projectsZomeApi.connection.create,
    createConnection,
    dispatch,
    projectsCellIdString
  )

  const outcomeMembersActionHashMap = await _cloneDataSet<OutcomeMember>(
    projectData.outcomeMembers,
    // closure in the depended upon
    cloneData<OutcomeMember>(outcomeActionHashMap),
    projectsZomeApi.outcomeMember.create,
    createOutcomeMember,
    dispatch,
    projectsCellIdString
  )

  const outcomeCommentActionHashMap = await _cloneDataSet<OutcomeComment>(
    projectData.outcomeComments,
    // closure in the depended upon
    cloneData<OutcomeComment>(outcomeActionHashMap),
    projectsZomeApi.outcomeComment.create,
    createOutcomeComment,
    dispatch,
    projectsCellIdString
  )

  const entryPointActionHashMap = await _cloneDataSet<EntryPoint>(
    projectData.entryPoints,
    // closure in the depended upon
    cloneData<EntryPoint>(outcomeActionHashMap),
    projectsZomeApi.entryPoint.create,
    createEntryPoint,
    dispatch,
    projectsCellIdString
  )

  // return the list of old addresses mapped to new addresses
  return {
    tagActionHashMap,
    outcomeActionHashMap,
    connectionsActionHashMap,
    outcomeMembersActionHashMap,
    outcomeCommentActionHashMap,
    entryPointActionHashMap,
  }
}

export async function importProjectData(
  projectData: ProjectExportDataV1,
  projectsCellIdString: CellIdString,
  dispatch: any
) {
  return internalImportProjectData(
    projectData,
    projectsCellIdString,
    dispatch,
    getAppWs,
    createProjectsZomeApi,
    cloneDataSet
  )
}
