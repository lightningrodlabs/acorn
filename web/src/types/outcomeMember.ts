import { HeaderHashB64, AgentPubKeyB64 } from "./shared";

export interface OutcomeMember {
    outcomeAddress: HeaderHashB64,
    // the "assignee"
    agentAddress: AgentPubKeyB64,
    // the person who authored this entry
    userEditHash: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}