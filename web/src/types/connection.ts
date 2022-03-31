import { HeaderHashB64 } from './shared'

export interface Connection {
    parentHeaderHash: HeaderHashB64,
    childHeaderHash: HeaderHashB64,
    randomizer: number, //i64,
    isImported: boolean,
}