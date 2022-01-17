import { START_TITLE_EDIT, END_TITLE_EDIT, START_DESCRIPTION_EDIT, END_DESCRIPTION_EDIT } from './actions'
// const defaultState = {
//   isOpen: false,
//   goalAddress: null,
// }
const defaultState = {}
// TODO: change this for tracking local state only
export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case START_TITLE_EDIT:
      return {
        ...state,
        goalAddress: payload.goalAddress,
        isTitle: true,
      }
    case START_DESCRIPTION_EDIT:
      return {
        ...state,
        goalAddress: payload.goalAddress,
        isTitle: false,
      }
    case END_TITLE_EDIT:
        return {}
    case END_DESCRIPTION_EDIT:
        return {}
    default:
      return state
  }
}
