import { AgentPubKeyB64, Option } from "./shared"

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