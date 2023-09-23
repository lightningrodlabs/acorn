import { LinkedOutcomeDetails, RelationInput } from '../../../types'
import { ActionHashB64, Option } from '../../../types/shared'

/* constants */
const OPEN_OUTCOME_FORM = 'OPEN_OUTCOME_FORM'
const CLOSE_OUTCOME_FORM = 'CLOSE_OUTCOME_FORM'
const UPDATE_CONTENT = 'UPDATE_CONTENT'

/* action creator functions */

export type OpenOutcomeFormPayload = {
  leftConnectionXPosition: number
  topConnectionYPosition: number
  editAddress: ActionHashB64
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>
  existingParentConnectionAddress: ActionHashB64
}

function openOutcomeForm(payload: OpenOutcomeFormPayload) {
  return {
    type: OPEN_OUTCOME_FORM,
    payload,
  }
}

function closeOutcomeForm() {
  return {
    type: CLOSE_OUTCOME_FORM,
  }
}

function updateContent(content: string) {
  return {
    type: UPDATE_CONTENT,
    payload: content,
  }
}

export {
  OPEN_OUTCOME_FORM,
  CLOSE_OUTCOME_FORM,
  UPDATE_CONTENT,
  openOutcomeForm,
  closeOutcomeForm,
  updateContent,
}
