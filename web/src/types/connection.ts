import { z } from 'zod'
import { ActionHashB64 } from './shared'

export const ConnectionSchema = z.object({
  parentActionHash: z.string(),
  childActionHash: z.string(),
  randomizer: z.number(),
  isImported: z.boolean(),
})
export interface Connection {
  parentActionHash: ActionHashB64
  childActionHash: ActionHashB64
  randomizer: number //i64,
  isImported: boolean
}
