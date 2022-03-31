// TODO: replace the possible types with the imported ones from @holochain/client

import { WireElement } from '../api/hdkCrud'

export type AgentPubKeyB64 = string
export type HeaderHashB64 = string
export type EntryHashB64 = string
export type Timestamp = number

export type CellIdString = string

export type Option<Inner> = Inner | null

export type HdkCrudAction<EntryType> =
  | Action<WireElement<EntryType>> // create and update
  | Action<Array<WireElement<EntryType>>> // fetch
  | Action<HeaderHashB64> // delete

export interface UpdateInput<CommittedType> {
  headerHash: HeaderHashB64
  entry: CommittedType
}

export interface FetchInputAll {
  All: null
}
export interface FetchInputSome {
  Specific: Array<EntryHashB64>
}
export type FetchInput = FetchInputAll | FetchInputSome

export type HcActionCreator<Payload> = (
  cellIdString: string,
  payload: Payload
) => Action<Payload>

export type Action<Payload> = {
  type: string
  payload: Payload
  meta?: {
    cellIdString?: string
  }
}

export type WithHeaderHash<EntryType> = EntryType & { headerHash: HeaderHashB64 }
