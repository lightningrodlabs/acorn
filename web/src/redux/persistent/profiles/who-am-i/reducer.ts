
import _ from 'lodash'
import { WireElement } from '../../../../api/hdkCrud'
import { Profile } from '../../../../types'
import { Option } from '../../../../types/shared'

import { WHOAMI, CREATE_WHOAMI, UPDATE_WHOAMI, WhoamiAction } from './actions'

type State = Option<WireElement<Profile>>
const defaultState: State = null

export default function(state: State = defaultState, action: WhoamiAction) {
  const { payload, type } = action
  switch (type) {
    case WHOAMI:
    case CREATE_WHOAMI:
    case UPDATE_WHOAMI:
      return payload
    default:
      return state
  }
}

export function hasFetchedForWhoami(state = false, action) {
  const { type } = action
  switch (type) {
    case WHOAMI:
      return true
    default:
      return state
  }
}
