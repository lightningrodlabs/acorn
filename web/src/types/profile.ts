import { AgentPubKeyB64, ActionHashB64 } from './shared'

type Status = "Online" | "Offline" | "Away"

export interface Profile {
    firstName: string,
    lastName: string,
    handle: string,
    status: Status,
    avatarUrl: string,
    agentPubKey: AgentPubKeyB64,
    isImported: boolean,
}

export type AssigneeWithActionHash = {
  profile: Profile
  outcomeMemberActionHash: ActionHashB64
}
