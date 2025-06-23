import { z } from 'zod'
import { fetchMyLocalProfile, writeMyLocalProfile } from '../../utils'
import { RootState } from '../../redux/reducer'
import { installProject } from '../../projects/installProject'
import { importProject } from './importProject'
import {
  BackwardsCompatibleAllProjectsExport,
  BackwardsCompatibleAllProjectsExportSchema,
} from 'zod-models'
import { internalJoinProject } from '../../projects/joinProject'
import { AppClient } from '@holochain/client'
import { setMyLocalProfile } from '../../redux/persistent/profiles/my-local-profile/actions'
import {
  setProjectMemberProfile,
  setProjectWhoami,
} from '../../redux/persistent/projects/members/actions'

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
  appWs: AppClient,
  iImportProject: typeof importProject,
  iInstallProject: typeof installProject,
  store: any,
  // main input data and callbacks
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  const migrationDataParsed: BackwardsCompatibleAllProjectsExport = BackwardsCompatibleAllProjectsExportSchema.parse(
    stringToJSONSchema.parse(migrationData)
  )

  const initialState: RootState = store.getState()
  const myAgentPubKey = initialState.agentAddress

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

  // write profile to localStorage (needs to happen before installing the
  // project cells as part of that)
  writeMyLocalProfile(migrationDataParsed.myProfile)
  store.dispatch(setMyLocalProfile(migrationDataParsed.myProfile))

  stepsSoFar++
  onStep(stepsSoFar, totalSteps)

  // import each individual project, notifying of progress after each
  // one completes
  for await (let projectData of projectsToMigrate) {
    const passphrase = projectData.projectMeta.passphrase
    const { cellIdString, whoami } = await iInstallProject(passphrase)
    store.dispatch(setProjectWhoami(cellIdString, whoami))
    store.dispatch(
      setProjectMemberProfile(
        cellIdString,
        whoami ? whoami.entry : await fetchMyLocalProfile()
      )
    )
    await iImportProject(
      appWs,
      cellIdString,
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
  appWebsocket: AppClient,
  store: any,
  migrationData: string,
  onStep: (completed: number, toComplete: number) => void
) {
  return internalImportProjectsData(
    appWebsocket,
    importProject,
    installProject,
    store,
    migrationData,
    onStep
  )
}
