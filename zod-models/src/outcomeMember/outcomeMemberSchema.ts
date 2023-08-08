import { z } from 'zod'

export const OutcomeMemberSchema = z.object({
  outcomeActionHash: z.string(),
  memberAgentPubKey: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})

export const ProjectOutcomeMembersStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(OutcomeMemberSchema)
)

export type ProjectOutcomeMembersState = z.infer<typeof ProjectOutcomeMembersStateSchema>
export type OutcomeMember = z.infer<typeof OutcomeMemberSchema>

export default OutcomeMemberSchema