import {
  OPEN_OUTCOME_FORM,
  CLOSE_OUTCOME_FORM,
  UPDATE_CONTENT,
  OpenOutcomeFormPayload,
} from './actions'

import { DELETE_OUTCOME_FULLY } from '../../persistent/projects/outcomes/actions'
import { LinkedOutcomeDetails } from '../../../types'
import { Option } from '../../../types/shared'

export type OutcomeFormState = {
  editAddress: string
  content: string
  isOpen: boolean
  leftConnectionXPosition: number
  topConnectionYPosition: number
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  // existingParentConnectionAddress is the actionHash of the connection that
  // we would delete, if any, while creating the new one
  existingParentConnectionAddress: string
}

const defaultState: OutcomeFormState = {
  editAddress: null,
  content: '',
  isOpen: false,
  leftConnectionXPosition: 0,
  topConnectionYPosition: 0,
  maybeLinkedOutcome: null,
  existingParentConnectionAddress: null,
}

export default function (state = defaultState, action: any): OutcomeFormState {
  const { payload, type } = action

  const resetVersion: OutcomeFormState = {
    ...state,
    isOpen: false,
    content: '',
    editAddress: null,
    maybeLinkedOutcome: null,
    existingParentConnectionAddress: null,
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
        ...(payload as OpenOutcomeFormPayload),
        isOpen: true,
      }
    case CLOSE_OUTCOME_FORM:
      return resetVersion
    default:
      return state
  }
}
