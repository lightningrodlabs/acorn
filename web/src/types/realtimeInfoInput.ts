import { ActionHashB64, Option } from './shared'
import { EditingOutcomeDetails } from './editingOutcomeDetails'

export interface RealtimeInfoInput {
  projectId: String
  outcomeBeingEdited: Option<EditingOutcomeDetails>
  outcomeExpandedView: Option<ActionHashB64>
}
