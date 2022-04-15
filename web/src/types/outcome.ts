import { OutcomeComment } from './outcomeComment'
import { OutcomeVote } from './outcomeVote'
import { Profile } from './profile'
import { AgentPubKeyB64, Option, WithHeaderHash } from './shared'

export interface Outcome {
  content: string
  creatorAgentPubKey: AgentPubKeyB64
  editorAgentPubKey: Option<AgentPubKeyB64>
  timestampCreated: number //f64,
  timestampUpdated: Option<number> //f64
  scope: Scope
  tags: Option<Array<string>>
  description: string
  timeFrame: Option<TimeFrame>
  isImported: boolean
}

export type AchievementStatus = 'Achieved' | 'NotAchieved'
export interface Small {
  Small: AchievementStatus
}

export type SmallsEstimate = number
export interface Uncertain {
  Uncertain: Option<SmallsEstimate>
}

export type Scope = Small | Uncertain
export interface TimeFrame {
  fromDate: number //f64,
  toDate: number //f64,
}

export type ComputedAchievementStatus = {
  uncertains: number
  smallsAchieved: number
  smallsTotal: number
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
  votes?: OutcomeVote[]
  // for representing this data in a nested tree structure
  children?: ComputedOutcome[]
}

// These are the things which are computed and stored within ProjectView
// for accessing across the multiple views, with pre-computed data
export type ComputedOutcome = WithHeaderHash<Outcome> & {
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
} & OptionalOutcomeData
