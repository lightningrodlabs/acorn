import { z } from 'zod'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import { RootState } from '../../redux/reducer'
import { createWhoami } from '../../redux/persistent/profiles/who-am-i/actions'
import { installProject } from '../../projects/installProject'
import { createProfilesZomeApi } from './zomeApiCreators'
import { installProjectAndImport } from './installProjectAndImport'
import ProfilesZomeApi from '../../api/profilesApi'
import { AllProjectsDataExport, AllProjectsDataExportSchema } from 'zod-models'
import { internalJoinProject } from '../../projects/joinProject'

const stringToJSONSchema = z.string().transform((str, ctx): any => {
  try {
    return JSON.parse(str)
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
    return z.NEVER
  }
})

export async function internalImportProjectsData(
  // dependencies
  profilesZomeApi: ProfilesZomeApi,
  iInstallProjectAndImport: typeof installProjectAndImport,
  iInstallProject: typeof installProject,
  store: any,
  // main input data and callbacks
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  const migrationDataParsed: AllProjectsDataExport = AllProjectsDataExportSchema.parse(
    stringToJSONSchema.parse(migrationData)
  )

  const initialState: RootState = store.getState()
  const myAgentPubKey = initialState.agentAddress

  const profilesCellIdString = initialState.cells.profiles
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
    await iInstallProjectAndImport(
      myAgentPubKey,
      projectData,
      passphrase,
      store.dispatch
    )
    stepsSoFar++
    onStep(stepsSoFar, totalSteps)
  }

  // join each project that has already been migrated by a peer
  for await (let projectData of migratedProjectsToJoin) {
    const passphrase = projectData.projectMeta.passphrase
    await internalJoinProject(passphrase, store.dispatch, iInstallProject)
    stepsSoFar++
    onStep(stepsSoFar, totalSteps)
  }
}

export default async function importProjectsData(
  store: any,
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  const appWebsocket = await getAppWs()
  const profilesZomeApi = createProfilesZomeApi(appWebsocket)
  return internalImportProjectsData(
    profilesZomeApi,
    installProjectAndImport,
    installProject,
    store,
    migrationData,
    onStep
  )
}
