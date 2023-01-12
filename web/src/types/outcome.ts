import { OutcomeComment } from './outcomeComment'
import { OutcomeVote } from './outcomeVote'
import { Profile } from './profile'
import { AgentPubKeyB64, Option, WithActionHash } from './shared'

export interface Outcome {
  content: string
  creatorAgentPubKey: AgentPubKeyB64
  editorAgentPubKey: Option<AgentPubKeyB64>
  timestampCreated: number //f64,
  timestampUpdated: Option<number> //f64
  scope: Scope
  tags: Option<Array<string>>
  description: string
  isImported: boolean
  githubLink: string
}

export type AchievementStatus = 'Achieved' | 'NotAchieved'
export type SmallTask = {
  complete: boolean
  task: string
}
export interface SmallScope {
  achievementStatus: AchievementStatus
  targetDate: Option<number>
  taskList: Array<SmallTask>
}

export interface TimeFrame {
  fromDate: number //f64,
  toDate: number //f64,
}
export type SmallsEstimate = number
export interface UncertainScope {
  smallsEstimate: Option<SmallsEstimate>
  timeFrame: Option<TimeFrame>
  inBreakdown: boolean
}

export type ScopeSmallVariant = { Small: SmallScope }
export type ScopeUncertainVariant = { Uncertain: UncertainScope }
export type Scope = ScopeSmallVariant | ScopeUncertainVariant

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
