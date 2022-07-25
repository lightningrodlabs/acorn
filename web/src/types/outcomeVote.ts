import { ActionHashB64, AgentPubKeyB64 } from "./shared"

export interface OutcomeVote {
    outcomeActionHash: ActionHashB64,
    urgency: number, //f64,
    importance: number, //f64,
    impact: number, //f64,
    effort: number, //f64,
    creatorAgentPubKey: AgentPubKeyB64,
    unixTimestamp: number, //f64,
    isImported: boolean,
}
