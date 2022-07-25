

import { OPEN_OUTCOME_FORM, CLOSE_OUTCOME_FORM, UPDATE_CONTENT } from './actions'

import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'

const defaultState = {
  editAddress: null,
  content: '',
  isOpen: false,
  leftConnectionXPosition: 0,
  topConnectionYPosition: 0,
  // these three go together
  // where the fromAddress is the actionHash of the 
  // Outcome that is the 'origin' of the connection
  // and relation indicates the 'port' in a sense, to be parent or child
  fromAddress: null,
  relation: null, // RELATION_AS_CHILD or RELATION_AS_PARENT
  // existingParentConnectionAddress is the actionHash of the connection that
  // we would delete in order to create a new one
  // ASSUMPTION: one parent
  existingParentConnectionAddress: null, // this is optional though
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
    existingParentConnectionAddress: null // this is optional though
  }

  switch (type) {
    case DELETE_OUTCOME_FULLY:
      return resetVersion
    case UPDATE_CONTENT:
      return {
        ...state,
        content: payload,
      }
    case OPEN_OUTCOME_FORM:
      return {
        ...state,
        isOpen: true,
        leftConnectionXPosition: payload.x,
        topConnectionYPosition: payload.y,
        editAddress: payload.editAddress,
        // these three go together
        fromAddress: payload.fromAddress,
        relation: payload.relation,
        // ASSUMPTION: one parent
        existingParentConnectionAddress: payload.existingParentConnectionAddress, // this is optional though
      }
    case CLOSE_OUTCOME_FORM:
      return resetVersion
    default:
      return state
  }
}
