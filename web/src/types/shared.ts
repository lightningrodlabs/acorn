export type AgentPubKeyB64 = string
export type HeaderHashB64 = string
export type EntryHashB64 = string
export type Timestamp = number

export type Option<Inner> = Inner | null

export interface WireElement<EntryType> {
    headerHash: HeaderHashB64,
    entryHash: EntryHashB64,
    entry: EntryType,
    createdAt: Timestamp,
    updatedAt: Timestamp,
}


