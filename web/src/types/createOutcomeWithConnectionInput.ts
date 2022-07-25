import { Outcome } from './outcome'
import { Option, ActionHashB64 } from './shared'

export interface CreateOutcomeWithConnectionInput {
  entry: Outcome
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
}

export interface LinkedOutcomeDetails {
  outcomeActionHash: ActionHashB64
  relation: RelationInput
}

export enum RelationInput {
  ExistingOutcomeAsParent = 'ExistingOutcomeAsParent',
  ExistingOutcomeAsChild = 'ExistingOutcomeAsChild',
}
