import {z} from 'zod'

const ConnectionV11Schema = z.object({
  parentActionHash: z.string(),
  childActionHash: z.string(),
  randomizer: z.number(), // needs to be broad enough to allow floats for backwards compatibility, but is now an int
  isImported: z.boolean(),
})

export type ConnectionV11 = z.infer<typeof ConnectionV11Schema>

export default ConnectionV11Schema