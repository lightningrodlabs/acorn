import { getAppWs } from '../../hcWebsockets'
import { createConnection } from '../../redux/persistent/projects/connections/actions'
import { createEntryPoint } from '../../redux/persistent/projects/entry-points/actions'
import { createOutcomeComment } from '../../redux/persistent/projects/outcome-comments/actions'
import { createOutcomeMember } from '../../redux/persistent/projects/outcome-members/actions'
import { createOutcome } from '../../redux/persistent/projects/outcomes/actions'
import { createTag } from '../../redux/persistent/projects/tags/actions'
import {
  Tag,
  Outcome,
  Connection,
  OutcomeMember,
  OutcomeComment,
  EntryPoint,
} from '../../types'
import { CellIdString } from '../../types/shared'
import { ProjectExportDataV1 } from '../export'
import {
  cloneDataSet,
  cloneTag,
  cloneOutcome,
  cloneConnection,
  cloneData,
} from './cloneFunctions'
import { createProjectsZomeApi } from './zomeApiCreators'

export async function internalCreateActionHashMapAndImportProjectData(
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

export async function createActionHashMapAndImportProjectData(
  projectData: ProjectExportDataV1,
  projectsCellIdString: CellIdString,
  dispatch: any
) {
  return internalCreateActionHashMapAndImportProjectData(
    projectData,
    projectsCellIdString,
    dispatch,
    getAppWs,
    createProjectsZomeApi,
    cloneDataSet
  )
}
