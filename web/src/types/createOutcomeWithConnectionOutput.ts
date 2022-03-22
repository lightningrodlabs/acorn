import { WireElement } from '../api/hdkCrud'
import { Outcome } from './outcome'
import { Connection } from './connection'
import { Option } from './shared'

export interface CreateOutcomeWithConnectionOutput {
    outcome: WireElement<Outcome>,
    maybeConnection: Option<WireElement<Connection>>,
}