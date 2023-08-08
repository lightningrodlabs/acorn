import {z} from 'zod'

const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  handle: z.string(),
  status: z.enum(['Online', 'Offline', 'Away']),
  avatarUrl: z.string(),
  agentPubKey: z.string(),
  isImported: z.boolean(),
})

export type Profile = z.infer<typeof ProfileSchema>
export default ProfileSchema