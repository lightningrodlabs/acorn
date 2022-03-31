import { AgentPubKeyB64, HeaderHashB64 } from "./shared";

export interface OutcomeComment {
    outcomeHeaderHash: HeaderHashB64,
    content: string,
    creatorAgentPubKey: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}
