import { ActionHashB64, AgentPubKeyB64 } from "./shared";

export interface OutcomeMember {
    outcomeActionHash: ActionHashB64,
    // the "assignee"
    memberAgentPubKey: AgentPubKeyB64,
    // the person who authored this entry
    creatorAgentPubKey: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}