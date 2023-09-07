import { Profile } from 'zod-models'
import { ActionHashB64 } from './shared'

export type AssigneeWithActionHash = {
  profile: Profile
  outcomeMemberActionHash: ActionHashB64
}
