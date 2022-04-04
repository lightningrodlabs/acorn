import { AgentPubKeyB64, HeaderHashB64 } from "./shared";

export interface EntryPoint {
    color: String,
    creatorAgentPubKey: AgentPubKeyB64,
    createdAt: number, //f64,
    outcomeHeaderHash: HeaderHashB64,
    isImported: boolean,
}