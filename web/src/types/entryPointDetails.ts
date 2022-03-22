import { WireElement } from '../api/hdkCrud'
import { EntryPoint } from './entryPoint'
import { Outcome } from './outcome'

export interface EntryPointDetails {
    entryPoints: Array<WireElement<EntryPoint>>,
    outcomes: Array<WireElement<Outcome>>,
}