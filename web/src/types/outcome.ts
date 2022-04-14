import { AgentPubKeyB64, Option, WithHeaderHash } from "./shared"

export interface Outcome {
    content: string,
    creatorAgentPubKey: AgentPubKeyB64,
    editorAgentPubKey: Option<AgentPubKeyB64>,
    timestampCreated: number, //f64,
    timestampUpdated: Option<number>, //f64
    scope: Scope,
    tags: Option<Array<string>>,
    description: string,
    timeFrame: Option<TimeFrame>,
    isImported: boolean,
}

export type AchievementStatus = "Achieved" | "NotAchieved"
export interface Small {
    Small: AchievementStatus
}

export type SmallsEstimate = number
export interface Uncertain {
    Uncertain: Option<SmallsEstimate>
}

export type Scope = Small | Uncertain
export interface TimeFrame {
    fromDate: number, //f64,
    toDate: number, //f64,
}


export type ComputedAchievementStatus = {
    uncertains: number // any descendants -> if number 
    smallsAchieved: number
    smallsTotal: number
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

// TODO: 
// fn computeSimpleAchievementStatus(as: ComputedAchievementStatus): ComputedSimpleAchievementStatus

export enum ComputedSimpleAchievementStatus {
    NotAchieved,
    Achieved,
    PartiallyAchieved,
}

export enum ComputedScope {
    Small,
    Uncertain,
    Big // has children and is not uncertain
}

// These are the things which are computed and stored within ProjectView
// for accessing across the multiple views, with pre-computed data
export type ComputedOutcome = WithHeaderHash<Outcome> & {
    computedScope: ComputedScope
    computedAchievementStatus: ComputedAchievementStatus
}