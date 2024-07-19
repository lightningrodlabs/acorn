import {
  Connection,
  CreateOutcomeWithConnectionInput,
  CreateOutcomeWithConnectionOutput,
  DeleteOutcomeFullyResponse,
  EntryPoint,
  EntryPointDetails,
  Member,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  ProjectMeta,
  RealtimeInfoInput,
  Tag,
} from '../types'
import { createCrudFunctions, WireRecord } from './hdkCrud'
import { AppClient, CellId } from '@holochain/client'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'
import callZome from './callZome'
import { ActionHashB64 } from '../types/shared'

const ENTRY_TYPE_NAMES = {
  OUTCOME: 'outcome',
  CONNECTION: 'connection',
  OUTCOME_COMMENT: 'outcome_comment',
  OUTCOME_MEMBER: 'outcome_member',
  ENTRY_POINT: 'entry_point',
  OUTCOME_VOTE: 'outcome_vote',
  TAG: 'tag',
  PROJECT_META: 'project_meta',
}

// Custom / non hdk_crud
const ZOME_FN_NAMES = {
  CREATE_OUTCOME_WITH_CONNECTION: 'create_outcome_with_connection',
  DELETE_OUTCOME_FULLY: 'delete_outcome_fully',
  FETCH_ENTRY_POINT_DETAILS: 'fetch_entry_point_details',
  SIMPLE_CREATE_PROJECT_META: 'simple_create_project_meta',
  FETCH_PROJECT_META: 'fetch_project_meta',
  CHECK_PROJECT_META_EXISTS: 'check_project_meta_exists',
  SEND_REALTIME_INFO_SIGNAL: 'emit_realtime_info_signal',
  FETCH_MEMBERS: 'fetch_members',
}

const OutcomeApi = (appWebsocket: AppClient) => {
  const outcomeCrud = createCrudFunctions<Outcome>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME
  )
  return {
    ...outcomeCrud,
    createOutcomeWithConnection: async (
      cellId: CellId,
      payload: CreateOutcomeWithConnectionInput
    ): Promise<CreateOutcomeWithConnectionOutput> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_OUTCOME_WITH_CONNECTION,
        payload
      )
    },
    deleteOutcomeFully: async (
      cellId: CellId,
      payload: ActionHashB64
    ): Promise<DeleteOutcomeFullyResponse> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.DELETE_OUTCOME_FULLY,
        payload
      )
    },
  }
}
const ConnectionApi = (appWebsocket: AppClient) => {
  return createCrudFunctions<Connection>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.CONNECTION
  )
}
const OutcomeCommentApi = (appWebsocket: AppClient) => {
  return createCrudFunctions<OutcomeComment>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME_COMMENT
  )
}
const OutcomeMemberApi = (appWebsocket: AppClient) => {
  return createCrudFunctions<OutcomeMember>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME_MEMBER
  )
}
const EntryPointApi = (appWebsocket: AppClient) => {
  const entryPointCrud = createCrudFunctions<EntryPoint>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.ENTRY_POINT
  )
  return {
    ...entryPointCrud,
    fetchEntryPointDetails: async (
      cellId: CellId
    ): Promise<EntryPointDetails> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_ENTRY_POINT_DETAILS,
        null
      )
    },
  }
}
const ProjectMetaApi = (appWebsocket: AppClient) => {
  const projectMetaCrud = createCrudFunctions<ProjectMeta>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.PROJECT_META
  )
  return {
    ...projectMetaCrud,
    simpleCreateProjectMeta: async (
      cellId: CellId,
      payload: ProjectMeta
    ): Promise<WireRecord<ProjectMeta>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.SIMPLE_CREATE_PROJECT_META,
        payload
      )
    },
    fetchProjectMeta: async (
      cellId: CellId
    ): Promise<WireRecord<ProjectMeta>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_PROJECT_META,
        null
      )
    },
    checkProjectMetaExists: async (cellId: CellId): Promise<boolean> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.CHECK_PROJECT_META_EXISTS,
        null
      )
    },
  }
}

const RealtimeInfoSignalApi = (appWebsocket: AppClient) => {
  return {
    send: async (cellId: CellId, payload: RealtimeInfoInput) => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.SEND_REALTIME_INFO_SIGNAL,
        payload
      )
    },
  }
}

const MembersApi = (appWebsocket: AppClient) => {
  return {
    fetch: async (cellId: CellId): Promise<Array<WireRecord<Member>>> => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_MEMBERS,
        null
      )
    },
  }
}

const TagApi = (appWebsocket: AppClient) => {
  return createCrudFunctions<Tag>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.TAG
  )
}

export default class ProjectsZomeApi {
  appWebsocket: AppClient
  outcome: ReturnType<typeof OutcomeApi>
  entryPoint: ReturnType<typeof EntryPointApi>
  connection: ReturnType<typeof ConnectionApi>
  outcomeComment: ReturnType<typeof OutcomeCommentApi>
  outcomeMember: ReturnType<typeof OutcomeMemberApi>
  tag: ReturnType<typeof TagApi>
  projectMeta: ReturnType<typeof ProjectMetaApi>
  realtimeInfoSignal: ReturnType<typeof RealtimeInfoSignalApi>
  member: ReturnType<typeof MembersApi>

  // one per entry type that uses hdk_crud
  // projectMeta, realtimeInfoSignal and member don't use hdk_crud
  constructor(appWebsocket: AppClient) {
    this.appWebsocket = appWebsocket
    this.outcome = OutcomeApi(appWebsocket)
    this.outcomeComment = OutcomeCommentApi(appWebsocket)
    this.entryPoint = EntryPointApi(appWebsocket)
    this.connection = ConnectionApi(appWebsocket)
    this.outcomeMember = OutcomeMemberApi(appWebsocket)
    this.projectMeta = ProjectMetaApi(appWebsocket)
    this.member = MembersApi(appWebsocket)
    this.tag = TagApi(appWebsocket)
    this.realtimeInfoSignal = RealtimeInfoSignalApi(appWebsocket)
  }
}
