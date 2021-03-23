

import { OPEN_GOAL_FORM, CLOSE_GOAL_FORM, UPDATE_CONTENT } from './actions'

import { archiveGoalFully } from '../projects/goals/actions'

const defaultState = {
  editAddress: null,
  parentAddress: null,
  content: '',
  isOpen: false,
  xLoc: 0,
  yLoc: 0,
}

export default function (state = defaultState, action) {
  const { payload, type } = action

  const resetVersion = {
    ...state,
    isOpen: false,
    content: '',
    parentAddress: null,
    editAddress: null,
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
        xLoc: payload.x,
        yLoc: payload.y,
        parentAddress: payload.parentAddress,
        editAddress: payload.editAddress,
      }
    case CLOSE_GOAL_FORM:
      return resetVersion
    default:
      return state
  }
}
