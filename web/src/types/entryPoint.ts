import { z } from 'zod'
import { AgentPubKeyB64, ActionHashB64 } from './shared'

export const EntryPointSchema = z.object({
  color: z.string(),
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  outcomeActionHash: z.string(),
  isImported: z.boolean(),
})
export interface EntryPoint {
  color: string
  creatorAgentPubKey: AgentPubKeyB64
  createdAt: number //f64,
  outcomeActionHash: ActionHashB64
  isImported: boolean
}
