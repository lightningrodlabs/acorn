import { Outcome } from 'zod-models'
import { Option, ActionHashB64 } from './shared'

export interface CreateOutcomeWithConnectionInput {
  entry: Outcome
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
}

export interface LinkedOutcomeDetails {
  // the ActionHashB64 of the
  // Outcome that is the 'origin' of the connection
  outcomeActionHash: ActionHashB64
  // `relation` indicates the 'port' in a sense, to be parent or child
  relation: RelationInput
  // when creating a new Connection, the siblingOrder is the number that
  // determines the order of the new Connection relative to its siblings
  siblingOrder: number
}

export enum RelationInput {
  ExistingOutcomeAsParent = 'ExistingOutcomeAsParent',
  ExistingOutcomeAsChild = 'ExistingOutcomeAsChild',
}
