import { AgentPubKeyB64, HeaderHashB64 } from "./shared";

export interface EntryPoint {
    color: String,
    creatorAddress: AgentPubKeyB64,
    createdAt: number, //f64,
    outcomeAddress: HeaderHashB64,
    isImported: boolean,
}