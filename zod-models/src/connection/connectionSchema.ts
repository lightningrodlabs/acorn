import {z} from 'zod'

const ConnectionSchema = z.object({
  parentActionHash: z.string(),
  childActionHash: z.string(),
  randomizer: z.number(), // needs to be broad enough to allow floats for backwards compatibility, but is now an int
  isImported: z.boolean(),
})

export const ProjectConnectionsStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(ConnectionSchema)
)

export type ProjectConnectionsState = z.infer<typeof ProjectConnectionsStateSchema>
export type Connection = z.infer<typeof ConnectionSchema>

export default ConnectionSchema