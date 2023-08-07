import {z} from 'zod'

export const OutcomeCommentSchema = z.object({
  outcomeActionHash: z.string(),
  content: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})

export const ProjectOutcomeCommentsStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(OutcomeCommentSchema)
)


export type OutcomeComment = z.infer<typeof OutcomeCommentSchema>
export type ProjectOutcomeCommentsState = z.infer<typeof ProjectOutcomeCommentsStateSchema>

export default OutcomeCommentSchema