import { START_TITLE_EDIT, END_TITLE_EDIT, START_DESCRIPTION_EDIT, END_DESCRIPTION_EDIT } from './actions'
// const defaultState = {
//   isOpen: false,
//   goalAddress: null,
// }
const defaultState = null
export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case START_TITLE_EDIT:
      return {
        goalAddress: payload.goalAddress,
        isTitle: true,
      }
    case START_DESCRIPTION_EDIT:
      return {
        goalAddress: payload.goalAddress,
        isTitle: false,
      }
    case END_TITLE_EDIT:
        return null
    case END_DESCRIPTION_EDIT:
        return null
    default:
      return state
  }
}
