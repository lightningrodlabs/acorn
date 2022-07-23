use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};

#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeVote {
    pub outcome_action_hash: ActionHashB64,
    pub urgency: f64,
    pub importance: f64,
    pub impact: f64,
    pub effort: f64,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeVote {
    pub fn new(
        outcome_action_hash: ActionHashB64,
        urgency: f64,
        importance: f64,
        impact: f64,
        effort: f64,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_action_hash,
            urgency,
            importance,
            impact,
            effort,
            creator_agent_pub_key,
            unix_timestamp,
            is_imported,
        }
    }
}
