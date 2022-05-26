import { HeaderHashB64 } from "./shared";

export interface DeleteOutcomeFullyResponse {
    outcomeHeaderHash: HeaderHashB64,
    deletedConnections: Array<HeaderHashB64>,
    deletedOutcomeMembers: Array<HeaderHashB64>,
    deletedOutcomeVotes: Array<HeaderHashB64>,
    deletedOutcomeComments: Array<HeaderHashB64>,
    deletedEntryPoints: Array<HeaderHashB64>,
}