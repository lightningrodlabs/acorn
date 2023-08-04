import { z } from 'zod'
import { OutcomeComment } from './outcomeComment'
import { OutcomeVote } from './outcomeVote'
import { Profile } from './profile'
import { AgentPubKeyB64, Option, WithActionHash } from './shared'

export type AchievementStatus = 'Achieved' | 'NotAchieved'

export const SmallTaskSchema = z.object({
  complete: z.boolean(),
  task: z.string(),
})
export type SmallTask = {
  complete: boolean
  task: string
}

export const SmallScopeSchema = z.object({
  achievementStatus: z.enum(['Achieved', 'NotAchieved']),
  targetDate: z.number().optional(),
  taskList: z.array(SmallTaskSchema),
})
export interface SmallScope {
  achievementStatus: AchievementStatus
  targetDate: Option<number>
  taskList: Array<SmallTask>
}

export const TimeFrameSchema = z.object({
  fromDate: z.number(),
  toDate: z.number(),
})
export interface TimeFrame {
  fromDate: number //f64,
  toDate: number //f64,
}
export const SmallsEstimateSchema = z.number()
export type SmallsEstimate = number

export const UncertainScopeSchema = z.object({
  smallsEstimate: SmallsEstimateSchema.optional(),
  timeFrame: TimeFrameSchema,
  inBreakdown: z.boolean(),
})
export interface UncertainScope {
  smallsEstimate: Option<SmallsEstimate>
  timeFrame: Option<TimeFrame>
  inBreakdown: boolean
}

export type ScopeSmallVariant = { Small: SmallScope }
export type ScopeUncertainVariant = { Uncertain: UncertainScope }

export const ScopeSchema = z.union([SmallScopeSchema, UncertainScopeSchema])
export type Scope = ScopeSmallVariant | ScopeUncertainVariant

export type ComputedAchievementStatus = {
  uncertains: number
  smallsAchieved: number
  smallsTotal: number
  tasksTotal: number // only for Smalls, 0 the rest of the time guaranteed
  tasksAchieved: number // only for Smalls, 0 the rest of the time guaranteed
  simple: ComputedSimpleAchievementStatus
}

export const OutcomeSchema = z.object({
  content: z.string(),
  creatorAgentPubKey: z.string(),
  editorAgentPubKey: z.string().optional(),
  timestampCreated: z.number().gt(0),
  timestampUpdated: z.number().gt(0).optional(),
  scope: ScopeSchema,
  tags: z.array(z.string()).optional(),
  description: z.string(),
  isImported: z.boolean(),
  githubLink: z.string().url(),
})
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
export type ComputedOutcome = WithActionHash<Outcome> & {
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
} & OptionalOutcomeData
