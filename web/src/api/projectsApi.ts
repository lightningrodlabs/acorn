import {
  Connection,
  EntryPoint,
  Outcome,
  OutcomeComment,
  OutcomeMember,
  OutcomeVote,
} from '../types'
import { EntryTypeApi } from './hdkCrud'
import { AppWebsocket, CellId } from '@holochain/client'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'

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
  return createCrudFunctions<Outcome>(appWebsocket, 'outcome')
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
    return createCrudFunctions<EntryPoint>(appWebsocket, 'entry_point')
}
const OutcomeVoteApi = (AppWebsocket: AppWebsocket) => {
    return createCrudFunctions<OutcomeVote>(AppWebsocket, 'outcome_vote')
}

export default class ProjectsZomeApi {
  appWebsocket: AppWebsocket
  outcome: EntryTypeApi<Outcome, Outcome>
  entryPoint: EntryTypeApi<EntryPoint, EntryPoint>
  connection: EntryTypeApi<Connection, Connection>
  outcomeComment: EntryTypeApi<OutcomeComment, OutcomeComment>
  outcomeMember: EntryTypeApi<OutcomeMember, OutcomeMember>
  outcomeVote: EntryTypeApi<OutcomeVote, OutcomeVote>

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
  }
}

// const projectsZomeApi = new ProjectsZomeApi(appWebsocket)

// await projectsZomeApi.outcome.fetch()
