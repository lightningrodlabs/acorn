

import { OPEN_GOAL_FORM, CLOSE_GOAL_FORM, UPDATE_CONTENT } from './actions'

import { archiveGoalFully } from '../projects/goals/actions'

const defaultState = {
  editAddress: null,
  content: '',
  isOpen: false,
  leftEdgeXPosition: 0,
  topEdgeYPosition: 0,
  // these two go together
  fromAddress: null,
  relation: null,
}

export default function (state = defaultState, action) {
  const { payload, type } = action

  const resetVersion = {
    ...state,
    isOpen: false,
    content: '',
    editAddress: null,
    // these two go together
    fromAddress: null,
    relation: null,
  }

  switch (type) {
    case archiveGoalFully.success().type:
      return resetVersion
    case UPDATE_CONTENT:
      return {
        ...state,
        content: payload,
      }
    case OPEN_GOAL_FORM:
      return {
        ...state,
        isOpen: true,
        leftEdgeXPosition: payload.x,
        topEdgeYPosition: payload.y,
        editAddress: payload.editAddress,
        // these two go together
        fromAddress: payload.fromAddress,
        relation: payload.relation,
      }
    case CLOSE_GOAL_FORM:
      return resetVersion
    default:
      return state
  }
}
