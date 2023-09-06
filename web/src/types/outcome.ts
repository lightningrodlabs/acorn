import { Connection, Profile } from 'zod-models'
import { WithActionHash } from './shared'
import { Outcome, OutcomeComment } from 'zod-models'

// TODO: convert to zod schema
export type ComputedAchievementStatus = {
  uncertains: number
  smallsAchieved: number
  smallsTotal: number
  tasksTotal: number // only for Smalls, 0 the rest of the time guaranteed
  tasksAchieved: number // only for Smalls, 0 the rest of the time guaranteed
  simple: ComputedSimpleAchievementStatus
}

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
  connection?: WithActionHash<Connection>
  // for representing this data in a nested tree structure
  children?: ComputedOutcome[]
}

// These are the things which are computed and stored within ProjectView
// for accessing across the multiple views, with pre-computed data
export type ComputedOutcome = WithActionHash<Outcome> & {
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
} & OptionalOutcomeData
