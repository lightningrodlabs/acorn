import { AgentPubKeyB64, HeaderHashB64, Option } from './shared'

interface ProjectMeta {
    creatorAddress: AgentPubKeyB64,
    createdAt: number, // f64
    name: string,
    image: Option<string>,
    passphrase: string,
    isImported: boolean,
    priorityMode: PriorityMode,
    topPriorityOutcomes: Array<HeaderHashB64>,
}

type PriorityMode = "Universal" | "Vote"