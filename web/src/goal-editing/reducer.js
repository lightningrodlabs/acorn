import { OPEN_EXPANDED_VIEW, CLOSE_EXPANDED_VIEW } from './actions'
import { START_TITLE_EDIT, END_TITLE_EDIT, START_DESCRIPTION_EDIT, END_DESCRIPTION_EDIT } from './actions'
// const defaultState = {
//   isOpen: false,
//   goalAddress: null,
// }
const defaultState = []

export default function(state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case OPEN_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: true,
        goalAddress: payload.goalAddress,
      }
    case CLOSE_EXPANDED_VIEW:
      return {
        ...state,
        isOpen: false,
        goalAddress: null,
      }
    case START_TITLE_EDIT:
      return state.push({
          goal: payload.goalAddress,
          title: true,
          editor: payload.agentAddress,
        })
    case START_DESCRIPTION_EDIT:
      return state.push({
          goal: payload.goalAddress,
          title: false,
          editor: payload.agentAddress,
        })
    case END_TITLE_EDIT:
        return state.filter( item => ((item.goalAddress != payload.goalAddress) || !item.title))
    case END_DESCRIPTION_EDIT:
        return state.filter( item => ((item.goalAddress != payload.goalAddress) || item.title))
    default:
      return state
  }
}
