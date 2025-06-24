import {
  BackwardsCompatibleConnection,
  BackwardsCompatibleProjectExport,
} from 'zod-models'
import ProjectsZomeApi from '../../api/projectsApi'
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
import { CellIdString, WithActionHash } from '../../types/shared'
import {
  cloneDataSet,
  cloneTag,
  cloneOutcome,
  cloneConnection,
  cloneData,
} from './cloneFunctions'
import { AppClient } from '@holochain/client'
import { createProjectsZomeApi } from './zomeApiCreators'

export async function internalCreateActionHashMapAndImportProjectData(
  projectData: BackwardsCompatibleProjectExport,
  projectsCellIdString: CellIdString,
  dispatch: any,
  projectsZomeApi: ProjectsZomeApi,
  iCloneDataSet: typeof cloneDataSet
) {
  /*
  outcomes, connections,
  outcomeMembers, outcomeComments,
  entryPoints, tags
  */

  // Strategy: do things with no data references first

  // TAGS
  // do tags because outcomes reference them
  const tagActionHashMap = await iCloneDataSet<WithActionHash<Tag>, Tag>(
    projectData.tags,
    cloneTag,
    projectsZomeApi.tag.create,
    createTag,
    dispatch,
    projectsCellIdString
  )

  // do outcomes because everything else references them
  const outcomeActionHashMap = await iCloneDataSet<
    WithActionHash<Outcome>,
    Outcome
  >(
    projectData.outcomes,
    // closure in the depended upon hashmap
    cloneOutcome(tagActionHashMap),
    projectsZomeApi.outcome.create,
    createOutcome,
    dispatch,
    projectsCellIdString
  )

  const connectionsActionHashMap = await iCloneDataSet<
    BackwardsCompatibleConnection,
    Connection
  >(
    projectData.connections,
    // closure in the depended upon
    cloneConnection(outcomeActionHashMap),
    projectsZomeApi.connection.create,
    createConnection,
    dispatch,
    projectsCellIdString
  )

  const outcomeMembersActionHashMap = await iCloneDataSet<
    WithActionHash<OutcomeMember>,
    OutcomeMember
  >(
    projectData.outcomeMembers,
    // closure in the depended upon
    cloneData<OutcomeMember>(outcomeActionHashMap),
    projectsZomeApi.outcomeMember.create,
    createOutcomeMember,
    dispatch,
    projectsCellIdString
  )

  const outcomeCommentActionHashMap = await iCloneDataSet<
    WithActionHash<OutcomeComment>,
    OutcomeComment
  >(
    projectData.outcomeComments,
    // closure in the depended upon
    cloneData<OutcomeComment>(outcomeActionHashMap),
    projectsZomeApi.outcomeComment.create,
    createOutcomeComment,
    dispatch,
    projectsCellIdString
  )

  const entryPointActionHashMap = await iCloneDataSet<
    WithActionHash<EntryPoint>,
    EntryPoint
  >(
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
  _appWebsocket: AppClient,
  projectData: BackwardsCompatibleProjectExport,
  projectsCellIdString: CellIdString,
  dispatch: any
) {
  const appWebsocket = await getAppWs()
  const projectsZomeApi = createProjectsZomeApi(appWebsocket)
  return internalCreateActionHashMapAndImportProjectData(
    projectData,
    projectsCellIdString,
    dispatch,
    projectsZomeApi,
    cloneDataSet
  )
}
