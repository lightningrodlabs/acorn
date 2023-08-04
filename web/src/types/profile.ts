import { z } from 'zod'
import { AgentPubKeyB64, ActionHashB64 } from './shared'

type Status = 'Online' | 'Offline' | 'Away'

export const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  handle: z.string(),
  status: z.enum(['Online', 'Offline', 'Away']),
  avatarUrl: z.string(),
  agentPubKey: z.string(),
  isImported: z.boolean(),
})
export interface Profile {
  firstName: string
  lastName: string
  handle: string
  status: Status
  avatarUrl: string
  agentPubKey: AgentPubKeyB64
  isImported: boolean
}

export type AssigneeWithActionHash = {
  profile: Profile
  outcomeMemberActionHash: ActionHashB64
}
