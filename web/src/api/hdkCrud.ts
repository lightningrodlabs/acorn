import { EntryHashB64, HeaderHashB64 } from "../types/shared"
import { CellId } from "@holochain/client"


export interface UpdateInput<CommittedType> {
  headerHash: HeaderHashB64
  entry: CommittedType
}

export interface WireElement<EntryType> {
  headerHash: HeaderHashB64
  entryHash: EntryHashB64
  entry: EntryType
  createdAt: number // nanoseconds
  updatedAt: number // nanoseconds
}

export interface FetchInputAll {
  All: null
}
export interface FetchInputSome {
  Specific: Array<EntryHashB64>
}
export type FetchInput = FetchInputAll | FetchInputSome

export interface EntryTypeApi<ToCommitType, CommittedType> {
  create: (cellId: CellId, entry: ToCommitType) => Promise<CommittedType>
  fetch: (cellId: CellId, fetchInput: FetchInput) => Promise<Array<CommittedType>>
  update: (
    cellId: CellId,
    updateInput: UpdateInput<ToCommitType>
  ) => Promise<CommittedType>
  delete: (cellId: CellId, address: HeaderHashB64) => Promise<void>
}