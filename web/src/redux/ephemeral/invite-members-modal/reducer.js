import {
  OPEN_INVITE_MEMBERS_MODAL,
  CLOSE_INVITE_MEMBERS_MODAL,
} from './actions'

const defaultState = {
  passphrase: null,
}

export default function (state = defaultState, action) {
  const { type, payload } = action
  switch (type) {
    case OPEN_INVITE_MEMBERS_MODAL:
      return {
        ...state,
        passphrase: payload,
      }
    case CLOSE_INVITE_MEMBERS_MODAL:
      return {
        ...state,
        passphrase: null,
      }
    default:
      return state
  }
}
