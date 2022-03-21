import { Outcome } from './outcome'
import { Option, HeaderHashB64 } from './shared'

export interface CreateOutcomeWithConnectionInput {
    entry: Outcome,
    maybeLinkedOutcome: Option<LinkedOutcomeDetails>,
}

export interface LinkedOutcomeDetails {
    outcomeAddress: HeaderHashB64,
    relation: RelationInput,
}


export type RelationInput = "ExistingOutcomeAsChild" | "ExistingOutcomeAsParent"