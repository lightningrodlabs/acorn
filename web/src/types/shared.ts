// TODO: replace the possible types with the imported ones from @holochain/client

import { WireRecord } from '../api/hdkCrud'

export type AgentPubKeyB64 = string
export type ActionHashB64 = string
export type EntryHashB64 = string
export type Timestamp = number

export type CellIdString = string

export type Option<Inner> = Inner | null

export type HdkCrudAction<EntryType> =
  | Action<WireRecord<EntryType>> // create and update
  | Action<Array<WireRecord<EntryType>>> // fetch
  | Action<ActionHashB64> // delete

export interface UpdateInput<CommittedType> {
  actionHash: ActionHashB64
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
  payload: Payload,
  skipLayoutAnimation?: boolean
) => Action<Payload>

export type Action<Payload> = {
  type: string
  payload: Payload
  meta?: {
    cellIdString?: string
  }
}

export type WithActionHash<EntryType> = EntryType & { actionHash: ActionHashB64 }
