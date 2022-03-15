import {
  Connection,
  EntryPoint,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  OutcomeVote,
  ProjectMeta,
} from '../types'
import { EntryTypeApi } from './hdkCrud'
import { AppWebsocket, CellId } from '@holochain/client'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'

const ZOME_FN_NAMES = {
  CREATE_OUTCOME_WITH_CONNECTION: 'create_outcome_with_connection',
  DELETE_OUTCOME_FULLY: 'delete_outcome_fully',
  FETCH_ENTRY_POINT_DETAILS: 'fetch_entry_point_details',
  SIMPLE_CREATE_PROJECT_META: 'simple_create_project_meta',
  FETCH_PROJECT_META: 'fetch_project_meta',
  CHECK_PROJECT_META_EXISTS: 'check_project_meta_exists',
  SEND_REALTIME_INFO_SIGNAL: 'emit_realtime_info_signal',
  FETCH_MEMBERS: 'fetch_members'
}

// define a custom interface for projectMeta and members

function createEntryName(entryType: string) {
  return `create_${entryType}`
}
function updateEntryName(entryType: string) {
  return `update_${entryType}`
}
function fetchEntryName(entryType: string) {
  return `fetch_${entryType}s`
}
function deleteEntryName(entryType: string) {
  return `delete_${entryType}`
}

async function callZome(
  appWebsocket: AppWebsocket,
  cellId: CellId,
  fnName: string,
  payload: any // payload
) {
  const provenance = cellId[1]
  return appWebsocket.callZome({
    cell_id: cellId,
    zome_name: PROJECTS_ZOME_NAME,
    fn_name: fnName,
    payload: payload,
    cap_secret: null,
    provenance,
  })
}

function createCrudFunctions<EntryType>(
  appWebsocket: AppWebsocket,
  entryType: string
): EntryTypeApi<EntryType, EntryType> {
  return {
    create: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, createEntryName(entryType), payload)
    },
    fetch: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, fetchEntryName(entryType), payload)
    },
    update: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, updateEntryName(entryType), payload)
    },
    delete: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, deleteEntryName(entryType), payload)
    },
  }
}

const OutcomeApi = (appWebsocket: AppWebsocket) => {
  const outcomeCrud = createCrudFunctions<Outcome>(appWebsocket, 'outcome')
  return {
    ...outcomeCrud,
    createOutcomeWithConnection: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, ZOME_FN_NAMES.CREATE_OUTCOME_WITH_CONNECTION, payload) 
    },
    deleteOutcomeFully: async (cellId, payload) => {
      return callZome(appWebsocket, cellId, ZOME_FN_NAMES.DELETE_OUTCOME_FULLY, payload)
    }
  }
}
const ConnectionApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<Connection>(appWebsocket, 'connection')
}
const OutcomeCommentApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<OutcomeComment>(appWebsocket, 'outcome_comment')
}
const OutcomeMemberApi = (appWebsocket: AppWebsocket) => {
  return createCrudFunctions<OutcomeMember>(appWebsocket, 'outcome_member')
}
const EntryPointApi = (appWebsocket: AppWebsocket) => {
    const entryPointCrud = createCrudFunctions<EntryPoint>(appWebsocket, 'entry_point')
    return {
      ...entryPointCrud,
      fetchEntryPointDetails: async (cellId, payload) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.FETCH_ENTRY_POINT_DETAILS, payload)
      }
    }
}
const OutcomeVoteApi = (appWebsocket: AppWebsocket) => {
    return createCrudFunctions<OutcomeVote>(AppWebsocket, 'outcome_vote')
}
const ProjectMetaApi = (appWebsocket: AppWebsocket) => {
    const projectMetaCrud = createCrudFunctions<ProjectMeta>(AppWebsocket, 'project_meta')
    return {
      ...projectMetaCrud,
      simpleCreateProjectMeta: async (cellId, payload) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.SIMPLE_CREATE_PROJECT_META, payload)
      },
      fetchProjectMeta: async (cellId) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.SIMPLE_CREATE_PROJECT_META, null)
      },
      checkProjectMetaExists: async (cellId) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.CHECK_PROJECT_META_EXISTS, null)
      },
    }
}

export default class ProjectsZomeApi {
  appWebsocket: AppWebsocket
  outcome: EntryTypeApi<Outcome, Outcome>
  entryPoint: EntryTypeApi<EntryPoint, EntryPoint>
  connection: EntryTypeApi<Connection, Connection>
  outcomeComment: EntryTypeApi<OutcomeComment, OutcomeComment>
  outcomeMember: EntryTypeApi<OutcomeMember, OutcomeMember>
  outcomeVote: EntryTypeApi<OutcomeVote, OutcomeVote>
  projectMeta: EntryTypeApi<ProjectMeta, ProjectMeta>
  realtimeInfoSignal
  members

  // one per entry type that uses hdk_crud
  // projectMeta and members don't use it
  constructor(appWebsocket: AppWebsocket) {
    this.appWebsocket = appWebsocket
    this.outcome = OutcomeApi(appWebsocket)
    this.outcomeComment = OutcomeCommentApi(appWebsocket)
    this.entryPoint = EntryPointApi(appWebsocket)
    this.connection = ConnectionApi(appWebsocket)
    this.outcomeMember = OutcomeMemberApi(appWebsocket)
    this.outcomeVote = OutcomeVoteApi(appWebsocket)
    this.projectMeta = ProjectMetaApi(appWebsocket)
    this.realtimeInfoSignal = {
      send: async (cellId, payload) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.SEND_REALTIME_INFO_SIGNAL, payload)
      }
    }
    this.members = {
      fetch: async (cellId) => {
        return callZome(appWebsocket, cellId, ZOME_FN_NAMES.FETCH_MEMBERS, null)
      }
    }
  }
}

// const projectsZomeApi = new ProjectsZomeApi(appWebsocket)

// await projectsZomeApi.outcome.fetch()
