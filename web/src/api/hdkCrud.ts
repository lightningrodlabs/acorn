import { EntryHashB64, FetchInput, HeaderHashB64, UpdateInput } from '../types/shared'
import { AppWebsocket, CellId } from '@holochain/client'
import callZome from './callZome'

export interface WireElement<EntryType> {
  headerHash: HeaderHashB64
  entryHash: EntryHashB64
  entry: EntryType
  createdAt: number // nanoseconds
  updatedAt: number // nanoseconds
}

export interface EntryTypeApi<ToCommitType, CommittedType> {
  create: (cellId: CellId, entry: ToCommitType) => Promise<CommittedType>
  fetch: (
    cellId: CellId,
    fetchInput: FetchInput
  ) => Promise<Array<CommittedType>>
  update: (
    cellId: CellId,
    updateInput: UpdateInput<ToCommitType>
  ) => Promise<CommittedType>
  delete: (cellId: CellId, headerHash: HeaderHashB64) => Promise<void>
}

export function createEntryName(entryType: string) {
  return `create_${entryType}`
}
export function updateEntryName(entryType: string) {
  return `update_${entryType}`
}
export function fetchEntryName(entryType: string) {
  return `fetch_${entryType}s`
}
export function deleteEntryName(entryType: string) {
  return `delete_${entryType}`
}

export function createCrudFunctions<EntryType>(
  appWebsocket: AppWebsocket,
  zomeName: string,
  entryType: string
): EntryTypeApi<EntryType, WireElement<EntryType>> {
  return {
    create: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        zomeName,
        createEntryName(entryType),
        payload
      )
    },
    fetch: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        zomeName,
        fetchEntryName(entryType),
        payload
      )
    },
    update: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        zomeName,
        updateEntryName(entryType),
        payload
      )
    },
    delete: async (cellId, payload) => {
      return callZome(
        appWebsocket,
        cellId,
        zomeName,
        deleteEntryName(entryType),
        payload
      )
    },
  }
}
