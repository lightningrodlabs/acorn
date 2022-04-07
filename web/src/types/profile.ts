import { AgentPubKeyB64 } from './shared'

type Status = "Online" | "Offline" | "Away"

export interface Profile {
    firstName: String,
    lastName: String,
    handle: String,
    status: Status,
    avatarUrl: String,
    agentPubKey: AgentPubKeyB64,
    isImported: boolean,
}

