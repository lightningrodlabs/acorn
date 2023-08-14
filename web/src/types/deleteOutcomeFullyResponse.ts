import { ActionHashB64 } from './shared'

export interface DeleteOutcomeFullyResponse {
  outcomeActionHash: ActionHashB64
  deletedConnections: Array<ActionHashB64>
  deletedOutcomeMembers: Array<ActionHashB64>
  deletedOutcomeVotes: Array<ActionHashB64>
  deletedOutcomeComments: Array<ActionHashB64>
  deletedEntryPoints: Array<ActionHashB64>
}
