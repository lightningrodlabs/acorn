import {
  Connection,
  EntryPoint,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  OutcomeVote,
  ProjectMeta,
} from '../types'
import { createCrudFunctions } from './hdkCrud'
import { AppWebsocket } from '@holochain/client'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'
import callZome from './callZome'

// TODO: add typescript types to `any` ones here

const ENTRY_TYPE_NAMES = {
  OUTCOME: 'outcome',
  CONNECTION: 'connection',
  OUTCOME_COMMENT: 'outcome_comment',
  OUTCOME_MEMBER: 'outcome_member',
  ENTRY_POINT: 'entry_point',
  OUTCOME_VOTE: 'outcome_vote',
  PROJECT_META: 'project_meta',
}

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

const OutcomeApi = (appWebsocket: AppWebsocket) => {
  const outcomeCrud = createCrudFunctions<Outcome>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME
  )
  return {
    ...outcomeCrud,
    createOutcomeWithConnection: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.CREATE_OUTCOME_WITH_CONNECTION,
        payload
      )
    },
    deleteOutcomeFully: async (cellId, payload) => {
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
const ConnectionApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<Connection>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.CONNECTION
  )
}
const OutcomeCommentApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<OutcomeComment>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME_COMMENT
  )
}
const OutcomeMemberApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<OutcomeMember>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME_MEMBER
  )
}
const EntryPointApi = (appWebsocket: AppWebsocket) => {
  const entryPointCrud = createCrudFunctions<EntryPoint>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.ENTRY_POINT
  )
  return {
    ...entryPointCrud,
    fetchEntryPointDetails: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.FETCH_ENTRY_POINT_DETAILS,
        payload
      )
    },
  }
}
const OutcomeVoteApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<OutcomeVote>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.OUTCOME_VOTE
  )
}
const ProjectMetaApi = (appWebsocket: AppWebsocket) => {
  const projectMetaCrud = createCrudFunctions<ProjectMeta>(
    appWebsocket,
    PROJECTS_ZOME_NAME,
    ENTRY_TYPE_NAMES.PROJECT_META
  )
  return {
    ...projectMetaCrud,
    simpleCreateProjectMeta: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.SIMPLE_CREATE_PROJECT_META,
        payload
      )
    },
    fetchProjectMeta: async (cellId) => {
      return callZome(
        appWebsocket,
        cellId,
        PROJECTS_ZOME_NAME,
        ZOME_FN_NAMES.SIMPLE_CREATE_PROJECT_META,
        null
      )
    },
    checkProjectMetaExists: async (cellId) => {
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

const RealtimeInfoSignalApi = (appWebsocket: AppWebsocket) => {
  return {
    send: async (cellId, payload) => {
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

const MembersApi = (appWebsocket: AppWebsocket) => {
  return {
    fetch: async (cellId) => {
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

export default class ProjectsZomeApi {
  appWebsocket: AppWebsocket
  outcome: ReturnType<typeof OutcomeApi>
  entryPoint: ReturnType<typeof EntryPointApi>
  connection: ReturnType<typeof ConnectionApi>
  outcomeComment: ReturnType<typeof OutcomeCommentApi>
  outcomeMember: ReturnType<typeof OutcomeMemberApi>
  outcomeVote: ReturnType<typeof OutcomeVoteApi>
  projectMeta: ReturnType<typeof ProjectMetaApi>
  realtimeInfoSignal: ReturnType<typeof RealtimeInfoSignalApi>
  member: ReturnType<typeof MembersApi>

  // one per entry type that uses hdk_crud
  // projectMeta and member don't use it
  constructor(appWebsocket: AppWebsocket) {
    this.appWebsocket = appWebsocket
    this.outcome = OutcomeApi(appWebsocket)
    this.outcomeComment = OutcomeCommentApi(appWebsocket)
    this.entryPoint = EntryPointApi(appWebsocket)
    this.connection = ConnectionApi(appWebsocket)
    this.outcomeMember = OutcomeMemberApi(appWebsocket)
    this.outcomeVote = OutcomeVoteApi(appWebsocket)
    this.projectMeta = ProjectMetaApi(appWebsocket)
    this.member = MembersApi(appWebsocket)
    this.realtimeInfoSignal = RealtimeInfoSignalApi(appWebsocket)
  }
}
