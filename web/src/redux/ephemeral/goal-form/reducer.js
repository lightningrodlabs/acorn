

import { OPEN_GOAL_FORM, CLOSE_GOAL_FORM, UPDATE_CONTENT } from './actions'

import { archiveGoalFully } from '../projects/goals/actions'

const defaultState = {
  editAddress: null,
  content: '',
  isOpen: false,
  leftEdgeXPosition: 0,
  topEdgeYPosition: 0,
  // these three go together
  // where the fromAddress is the headerHash of the 
  // Goal that is the 'origin' of the edge
  // and relation indicates the 'port' in a sense, to be parent or child
  fromAddress: null,
  relation: null, // RELATION_AS_CHILD or RELATION_AS_PARENT
  // existingParentEdgeAddress is the headerHash of the edge that
  // we would delete in order to create a new one
  // ASSUMPTION: one parent
  existingParentEdgeAddress: null, // this is optional though
}

export default function (state = defaultState, action) {
  const { payload, type } = action

  const resetVersion = {
    ...state,
    isOpen: false,
    content: '',
    editAddress: null,
    // these three go together
    fromAddress: null,
    relation: null,
    // ASSUMPTION: one parent
    existingParentEdgeAddress: null // this is optional though
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
        // these three go together
        fromAddress: payload.fromAddress,
        relation: payload.relation,
        // ASSUMPTION: one parent
        existingParentEdgeAddress: payload.existingParentEdgeAddress, // this is optional though
      }
    case CLOSE_GOAL_FORM:
      return resetVersion
    default:
      return state
  }
}
