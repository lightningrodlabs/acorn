import { AgentPubKeyB64, HeaderHashB64, Option } from './shared'

export interface ProjectMeta {
    creatorAddress: AgentPubKeyB64,
    createdAt: number, // f64
    name: string,
    image: Option<string>,
    passphrase: string,
    isImported: boolean,
    priorityMode: PriorityMode,
    topPriorityOutcomes: Array<HeaderHashB64>,
}

export type PriorityMode = "Universal" | "Vote"