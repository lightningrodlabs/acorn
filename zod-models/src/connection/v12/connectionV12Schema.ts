import {z} from 'zod'

const ConnectionV12Schema = z.object({
  parentActionHash: z.string(),
  childActionHash: z.string(),
  siblingOrder: z.number(),
  randomizer: z.number(), // needs to be broad enough to allow floats for backwards compatibility, but is now an int
  isImported: z.boolean(),
})

export type ConnectionV12 = z.infer<typeof ConnectionV12Schema>

export default ConnectionV12Schema