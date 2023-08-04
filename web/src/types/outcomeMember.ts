import { z } from 'zod'
import { ActionHashB64, AgentPubKeyB64 } from './shared'

export const OutcomeMemberSchema = z.object({
  outcomeActionHash: z.string(),
  memberAgentPubKey: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})
export interface OutcomeMember {
  outcomeActionHash: ActionHashB64
  // the "assignee"
  memberAgentPubKey: AgentPubKeyB64
  // the person who authored this entry
  creatorAgentPubKey: AgentPubKeyB64
  unixTimestamp: number //f64,
  isImported: boolean
}
