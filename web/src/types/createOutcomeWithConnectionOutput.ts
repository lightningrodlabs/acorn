import { Connection, Outcome } from 'zod-models'
import { WireRecord } from '../api/hdkCrud'
import { Option } from './shared'

export interface CreateOutcomeWithConnectionOutput {
  outcome: WireRecord<Outcome>
  maybeConnection: Option<WireRecord<Connection>>
}
