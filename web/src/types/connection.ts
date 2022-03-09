import { HeaderHashB64 } from './shared'

export interface Connection {
    parentAddress: HeaderHashB64,
    childAddress: HeaderHashB64,
    randomizer: number, //i64,
    isImported: boolean,
}