import { Outcome } from './outcome'
import { Option, HeaderHashB64 } from './shared'

export interface CreateOutcomeWithConnectionInput {
  entry: Outcome
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
}

export interface LinkedOutcomeDetails {
  outcomeHeaderHash: HeaderHashB64
  relation: RelationInput
}

export enum RelationInput {
  ExistingOutcomeAsParent = 'ExistingOutcomeAsParent',
  ExistingOutcomeAsChild = 'ExistingOutcomeAsChild',
}
