import { z } from 'zod'
import { AgentPubKeyB64, ActionHashB64 } from './shared'

export const OutcomeCommentSchema = z.object({
  outcomeActionHash: z.string(),
  content: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})
export interface OutcomeComment {
  outcomeActionHash: ActionHashB64
  content: string
  creatorAgentPubKey: AgentPubKeyB64
  unixTimestamp: number //f64,
  isImported: boolean
}
