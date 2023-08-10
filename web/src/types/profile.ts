import { Profile as _Profile } from 'zod-models'
import { ActionHashB64 } from './shared'

export type Profile = _Profile

export type AssigneeWithActionHash = {
  profile: Profile
  outcomeMemberActionHash: ActionHashB64
}
