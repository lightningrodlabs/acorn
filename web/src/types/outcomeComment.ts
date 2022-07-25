import { AgentPubKeyB64, ActionHashB64 } from "./shared";

export interface OutcomeComment {
    outcomeActionHash: ActionHashB64,
    content: string,
    creatorAgentPubKey: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}
