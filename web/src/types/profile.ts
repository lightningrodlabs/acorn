import { AgentPubKeyB64, HeaderHashB64 } from './shared'

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

export type AssigneeWithHeaderHash = {
  profile: Profile
  outcomeMemberHeaderHash: HeaderHashB64
}
