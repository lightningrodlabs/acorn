import { WireRecord } from '../api/hdkCrud'
import { Outcome } from './outcome'
import { Connection } from './connection'
import { Option } from './shared'

export interface CreateOutcomeWithConnectionOutput {
  outcome: WireRecord<Outcome>
  maybeConnection: Option<WireRecord<Connection>>
}
