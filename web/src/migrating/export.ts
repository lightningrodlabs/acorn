import { AllProjectsDataExport, ProjectExportData } from 'zod-models'
import constructProjectDataFetchers from '../api/projectDataFetchers'
import ProjectsZomeApi from '../api/projectsApi'
import { RootState } from '../redux/reducer'
import { ProjectMeta } from '../types'
import { ActionHashB64, CellIdString } from '../types/shared'
import { cellIdFromString } from '../utils'
import { AppAgentClient } from '@holochain/client'

export type ExportType = 'csv' | 'json'

export async function updateProjectMeta(
  appWebsocket: AppAgentClient,
  projectMeta: ProjectMeta,
  actionHash: ActionHashB64,
  cellIdString: CellIdString
) {
  const cellId = cellIdFromString(cellIdString)
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await projectsZomeApi.projectMeta.update(cellId, {
    entry: projectMeta,
    actionHash,
  })
}

export async function internalExportProjectsData(
  constructProjectDataFetchersFunction: typeof constructProjectDataFetchers,
  collectExportProjectDataFunction: typeof collectExportProjectData,
  iUpdateProjectMeta: typeof updateProjectMeta,
  appWebsocket: AppAgentClient,
  store: any,
  toVersion: string,
  onStep: (completed: number, toComplete: number) => void,
  integrityVersion: number
): Promise<AllProjectsDataExport | null> {
  const initialState: RootState = store.getState()

  if (!initialState.whoami) {
    return null
  }

  // the profile of the current user
  const myProfile = initialState.whoami.entry
  // this is the variable to capture the final data for export
  const allProjectsDataExport: AllProjectsDataExport = {
    myProfile,
    projects: [],
    integrityVersion,
  }
  const projectCellIds = initialState.cells.projects

  // one at a time for each project
  let completedTracker = 0
  for await (let projectCellId of projectCellIds) {
    // step 1: make sure all the data is fetched
    // and integrated into the redux store
    const projectDataFetchers = constructProjectDataFetchersFunction(
      appWebsocket,
      store.dispatch,
      projectCellId
    )
    try {
      await Promise.all([
        projectDataFetchers.fetchProjectMeta(),
        projectDataFetchers.fetchEntryPoints(),
        projectDataFetchers.fetchOutcomeComments(),
        projectDataFetchers.fetchOutcomeMembers(),
        projectDataFetchers.fetchTags(),
        projectDataFetchers.fetchOutcomes(),
        projectDataFetchers.fetchConnections(),
      ])
    } catch (e) {
      // fetch project meta will fail if the there IS no project meta
      // and in that case we can just skip this project
      // this solves for unsynced and uncanceled projects
      if (e?.data?.data?.includes('no project meta exists')) {
        // throw e
        completedTracker++
        onStep(completedTracker, projectCellIds.length)
        continue
      } else {
        throw e
      }
    }
    // step 2: collect the data to be exported for each project
    const allDataFetchedState: RootState = store.getState()
    const exportProjectData = collectExportProjectDataFunction(
      allDataFetchedState,
      projectCellId
    )
    allProjectsDataExport.projects.push(exportProjectData)
    // mark the projectMeta as having been migrated, and to which version
    const { actionHash, ...projectMetaDetails } = exportProjectData.projectMeta
    const newProjectMeta: ProjectMeta = {
      ...projectMetaDetails,
      isMigrated: toVersion,
    }
    await iUpdateProjectMeta(appWebsocket, newProjectMeta, actionHash, projectCellId)
    completedTracker++
    onStep(completedTracker, projectCellIds.length)
  }
  return allProjectsDataExport
}

export default async function exportProjectsData(
  appWebsocket: AppAgentClient,
  store: any,
  toVersion: string,
  fromIntegrityVersion: number,
  onStep: (completed: number, toComplete: number) => void
) {
  return internalExportProjectsData(
    constructProjectDataFetchers,
    collectExportProjectData,
    updateProjectMeta,
    appWebsocket,
    store,
    toVersion,
    onStep,
    fromIntegrityVersion
  )
}

export function collectExportProjectData(
  state: RootState,
  projectCellId: CellIdString
): ProjectExportData {
  const outcomes = state.projects.outcomes[projectCellId] || {}
  const connections = state.projects.connections[projectCellId] || {}
  const outcomeMembers = state.projects.outcomeMembers[projectCellId] || {}
  const outcomeComments = state.projects.outcomeComments[projectCellId] || {}
  const entryPoints = state.projects.entryPoints[projectCellId] || {}
  const tags = state.projects.tags[projectCellId] || {}
  const activeProjectMeta = state.projects.projectMeta[projectCellId]
  const data = {
    projectMeta: activeProjectMeta,
    outcomes,
    connections,
    outcomeMembers,
    outcomeComments,
    entryPoints,
    tags,
  }
  return data
}

export function projectDataToCsv(data: ProjectExportData): string {
  const csvRows = []
  // const agents = Object.keys(data.agents)
  const outcomes = Object.keys(data.outcomes)
  const connections = Object.keys(data.connections)
  const outcomeMembers = Object.keys(data.outcomeMembers)
  const outcomeComments = Object.keys(data.outcomeComments)
  const entryPoints = Object.keys(data.entryPoints)
  const tags = Object.keys(data.tags)

  const loop = (dataset, headers, data) => {
    const csvRows = []

    csvRows.push(dataset)
    csvRows.push(Object.keys(data[headers[0]]).join(','))
    for (const index in headers) {
      csvRows.push(Object.values(data[headers[index]]))
    }
    return csvRows.join('\n')
  }

  // if (agents.length > 0) csvRows.push(loop('agents', agents, data.agents))
  if (outcomes.length > 0)
    csvRows.push('\n' + loop('outcomes', outcomes, data.outcomes))
  if (connections.length > 0)
    csvRows.push('\n' + loop('connections', connections, data.connections))
  if (outcomeMembers.length > 0)
    csvRows.push(
      '\n' + loop('outcomeMembers', outcomeMembers, data.outcomeMembers)
    )
  if (outcomeComments.length > 0)
    csvRows.push(
      '\n' + loop('outcomeComments', outcomeComments, data.outcomeComments)
    )
  if (entryPoints.length > 0)
    csvRows.push('\n' + loop('entryPoints', entryPoints, data.entryPoints))
  if (tags.length > 0) csvRows.push('\n' + loop('tags', tags, data.tags))

  return csvRows.join('\n')
}

export function exportDataHref(type: ExportType, data: string): string {
  let blob: Blob
  if (type === 'csv') {
    blob = new Blob([data], {
      type: 'text/csv',
    })
  } else if (type === 'json') {
    blob = new Blob([data], {
      type: 'application/json',
    })
  }
  const url = window.URL.createObjectURL(blob)
  return url
}
