import { OutcomeComment } from './outcomeComment'
import { OutcomeVote } from './outcomeVote'
import { Profile } from './profile'
import { WithActionHash } from './shared'
import {
  SmallTask as _SmallTask,
  SmallScope as _SmallScope,
  TimeFrame as _TimeFrame,
  SmallsEstimate as _SmallsEstimate,
  UncertainScope as _UncertainScope,
  Scope as _Scope,
  Outcome as _Outcome,
  AchievementStatus as _AchievementStatus,
  OutcomeSchema as _OutcomeSchema,
} from 'zod-models'

export type AchievementStatus = _AchievementStatus

export type SmallTask = _SmallTask
export type SmallScope = _SmallScope
export type SmallsEstimate = _SmallsEstimate
export type ScopeSmallVariant = SmallScope

export type TimeFrame = _TimeFrame
export type UncertainScope = _UncertainScope
export type ScopeUncertainVariant = UncertainScope

export type Scope = _Scope

// TODO: convert to zod schema
export type ComputedAchievementStatus = {
  uncertains: number
  smallsAchieved: number
  smallsTotal: number
  tasksTotal: number // only for Smalls, 0 the rest of the time guaranteed
  tasksAchieved: number // only for Smalls, 0 the rest of the time guaranteed
  simple: ComputedSimpleAchievementStatus
}

export type Outcome = _Outcome
export const OutcomeSchema = _OutcomeSchema
/*
Uncertain
{
    uncertains: 2
    smallsAchieved: 10
    smallsTotal: 10
}
Known Partial Achievement
{
    uncertains: 0
    smallsAchieved: 5
    smallsTotal: 10
}
Known Achieved
{
    uncertains: 0
    smallsAchieved: 10
    smallsTotal: 10
}
*/

export enum ComputedSimpleAchievementStatus {
  NotAchieved = 'NotAchieved',
  Achieved = 'Achieved',
  PartiallyAchieved = 'PartiallyAchieved',
}

export enum ComputedScope {
  Small = 'Small',
  Uncertain = 'Uncertain',
  Big = 'Big', // has children and is not uncertain
}

export type OptionalOutcomeData = {
  members?: Profile[]
  comments?: OutcomeComment[]
  votes?: OutcomeVote[]
  // for representing this data in a nested tree structure
  children?: ComputedOutcome[]
  depth?: number
}

// These are the things which are computed and stored within ProjectView
// for accessing across the multiple views, with pre-computed data
export type ComputedOutcome = WithActionHash<Outcome> & {
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
} & OptionalOutcomeData
