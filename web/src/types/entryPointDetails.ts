import { WireRecord } from '../api/hdkCrud'
import { Outcome, EntryPoint } from 'zod-models'

export interface EntryPointDetails {
  entryPoints: Array<WireRecord<EntryPoint>>
  outcomes: Array<WireRecord<Outcome>>
}
