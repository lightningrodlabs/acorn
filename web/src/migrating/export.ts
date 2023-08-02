import constructProjectDataFetchers from '../api/projectDataFetchers'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'
import { ProjectConnectionsState } from '../redux/persistent/projects/connections/reducer'
import { ProjectEntryPointsState } from '../redux/persistent/projects/entry-points/reducer'
import { ProjectOutcomeCommentsState } from '../redux/persistent/projects/outcome-comments/reducer'
import { ProjectOutcomeMembersState } from '../redux/persistent/projects/outcome-members/reducer'
import { ProjectOutcomesState } from '../redux/persistent/projects/outcomes/reducer'
import { RootState } from '../redux/reducer'
import { Profile, ProjectMeta, Tag } from '../types'
import { ActionHashB64, CellIdString, WithActionHash } from '../types/shared'
import { cellIdFromString } from '../utils'

export type ExportType = 'csv' | 'json'

export type ProjectExportDataV1 = {
  projectMeta: WithActionHash<ProjectMeta>
  outcomes: ProjectOutcomesState
  connections: ProjectConnectionsState
  outcomeMembers: ProjectOutcomeMembersState
  outcomeComments: ProjectOutcomeCommentsState
  entryPoints: ProjectEntryPointsState
  tags: {
    [actionHash: string]: WithActionHash<Tag>
  }
}

export type AllProjectsDataExport = {
  myProfile: Profile
  projects: ProjectExportDataV1[]
  integrityVersion: string
}

export async function updateProjectMeta(
  projectMeta: ProjectMeta,
  actionHash: ActionHashB64,
  cellIdString: CellIdString
) {
  const cellId = cellIdFromString(cellIdString)
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await projectsZomeApi.projectMeta.update(cellId, {
    entry: projectMeta,
    actionHash,
  })
}

export async function internalExportProjectsData(
  constructProjectDataFetchersFunction: typeof constructProjectDataFetchers,
  collectExportProjectDataFunction: typeof collectExportProjectData,
  _updateProjectMeta: typeof updateProjectMeta,
  store: any,
  toVersion: string,
  onStep: (completed: number, toComplete: number) => void,
  integrityVersion: string
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
      store.dispatch,
      projectCellId
    )
    await Promise.all([
      projectDataFetchers.fetchProjectMeta(),
      projectDataFetchers.fetchEntryPoints(),
      projectDataFetchers.fetchOutcomeComments(),
      projectDataFetchers.fetchOutcomeMembers(),
      projectDataFetchers.fetchTags(),
      projectDataFetchers.fetchOutcomes(),
      projectDataFetchers.fetchConnections(),
    ])
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
    await _updateProjectMeta(newProjectMeta, actionHash, projectCellId)
    completedTracker++
    onStep(completedTracker, projectCellIds.length)
  }
  return allProjectsDataExport
}

export default async function exportProjectsData(
  store: any,
  toVersion: string,
  onStep: (completed: number, toComplete: number) => void
) {
  return internalExportProjectsData(
    constructProjectDataFetchers,
    collectExportProjectData,
    updateProjectMeta,
    store,
    toVersion,
    onStep,
    '8' // TODO: replace with INTEGRITY_VERSION_NUMBER
    // INTEGRITY_VERSION_NUMBER
  )
}

export function collectExportProjectData(
  state: RootState,
  projectCellId: CellIdString
): ProjectExportDataV1 {
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

export function projectDataToCsv(data: ProjectExportDataV1): string {
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

export function exportDataHref(
  type: ExportType,
  data: string
): string {
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
