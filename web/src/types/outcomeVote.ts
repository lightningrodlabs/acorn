import { HeaderHashB64, AgentPubKeyB64 } from "./shared"

export interface OutcomeVote {
    outcomeHeaderHash: HeaderHashB64,
    urgency: number, //f64,
    importance: number, //f64,
    impact: number, //f64,
    effort: number, //f64,
    creatorAgentPubKey: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}
