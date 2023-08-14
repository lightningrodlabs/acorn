import { WireRecord } from '../api/hdkCrud'
import { EntryPoint } from './entryPoint'
import { Outcome } from './outcome'

export interface EntryPointDetails {
  entryPoints: Array<WireRecord<EntryPoint>>
  outcomes: Array<WireRecord<Outcome>>
}
