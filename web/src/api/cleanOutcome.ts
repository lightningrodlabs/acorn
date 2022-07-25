// we can't pass a ComputedOutcome to the backend

import { ComputedOutcome, Outcome } from '../types'

// so we strip it back to just the holochain version of an Outcome.
// The function acts with immutability
const cleanOutcome = (computedOutcome: ComputedOutcome): Outcome => {
  const {
    computedAchievementStatus,
    computedScope,
    actionHash,
    children,
    members,
    comments,
    votes,
    ...outcome
  } = computedOutcome
  return {
    ...outcome,
  }
}

export default cleanOutcome
