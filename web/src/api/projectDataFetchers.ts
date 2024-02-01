import { AppAgentClient } from '@holochain/client'
import { fetchConnections } from '../redux/persistent/projects/connections/actions'
import { fetchEntryPoints } from '../redux/persistent/projects/entry-points/actions'
import { fetchMembers } from '../redux/persistent/projects/members/actions'
import { fetchOutcomeComments } from '../redux/persistent/projects/outcome-comments/actions'
import { fetchOutcomeMembers } from '../redux/persistent/projects/outcome-members/actions'
import { fetchOutcomes } from '../redux/persistent/projects/outcomes/actions'
import { fetchProjectMeta } from '../redux/persistent/projects/project-meta/actions'
import { fetchTags } from '../redux/persistent/projects/tags/actions'
import { CellIdString } from '../types/shared'
import { cellIdFromString } from '../utils'
import ProjectsZomeApi from './projectsApi'

export default function constructProjectDataFetchers(
  appWebsocket: AppAgentClient,
  dispatch: any,
  cellIdString: CellIdString
) {
  const cellId = cellIdFromString(cellIdString)
  return {
    fetchProjectMeta: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const projectMeta = await projectsZomeApi.projectMeta.fetchProjectMeta(
        cellId
      )
      // is not currently a layout affecting action
      return dispatch(fetchProjectMeta(cellIdString, projectMeta))
    },
    fetchEntryPoints: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const entryPoints = await projectsZomeApi.entryPoint.fetch(cellId, {
        All: null,
      })
      // is not currently a layout affecting action
      return dispatch(fetchEntryPoints(cellIdString, entryPoints))
    },
    fetchMembers: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const members = await projectsZomeApi.member.fetch(cellId)
      // is not currently a layout affecting action
      return dispatch(fetchMembers(cellIdString, members))
    },
    fetchOutcomes: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomes = await projectsZomeApi.outcome.fetch(cellId, {
        All: null,
      })
      const skipLayoutAnimation = true
      return dispatch(
        fetchOutcomes(cellIdString, outcomes, skipLayoutAnimation)
      )
    },
    fetchConnections: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const connections = await projectsZomeApi.connection.fetch(cellId, {
        All: null,
      })
      const skipLayoutAnimation = true
      return dispatch(
        fetchConnections(cellIdString, connections, skipLayoutAnimation)
      )
    },
    fetchOutcomeMembers: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeMembers = await projectsZomeApi.outcomeMember.fetch(cellId, {
        All: null,
      })
      const skipLayoutAnimation = true
      return dispatch(
        fetchOutcomeMembers(cellIdString, outcomeMembers, skipLayoutAnimation)
      )
    },
    fetchOutcomeComments: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeComments = await projectsZomeApi.outcomeComment.fetch(
        cellId,
        { All: null }
      )
      // is not currently a layout affecting action
      return dispatch(fetchOutcomeComments(cellIdString, outcomeComments))
    },
    fetchTags: async () => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const tags = await projectsZomeApi.tag.fetch(cellId, { All: null })
      const skipLayoutAnimation = true
      return dispatch(fetchTags(cellIdString, tags, skipLayoutAnimation))
    },
  }
}
