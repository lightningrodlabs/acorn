import {z} from 'zod'

const EntryPointSchema = z.object({
  color: z.string(),
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  outcomeActionHash: z.string(),
  isImported: z.boolean(),
})

export const ProjectEntryPointsStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(EntryPointSchema)
)

export type EntryPoint = z.infer<typeof EntryPointSchema>
export type ProjectEntryPointsState = z.infer<typeof ProjectEntryPointsStateSchema>

export default EntryPointSchema