import { Profile } from 'zod-models'
import { SET_MY_LOCAL_PROFILE } from './actions'

const defaultState: Profile = null

export default function (state = defaultState, action: any): Profile {
  const { payload, type } = action
  switch (type) {
    case SET_MY_LOCAL_PROFILE:
      return payload
    default:
      return state
  }
}
