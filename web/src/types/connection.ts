import { ActionHashB64 } from './shared'

export interface Connection {
    parentActionHash: ActionHashB64,
    childActionHash: ActionHashB64,
    randomizer: number, //i64,
    isImported: boolean,
}