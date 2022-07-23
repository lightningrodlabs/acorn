use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};

#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeComment {
    pub outcome_action_hash: ActionHashB64,
    pub content: String,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeComment {
    pub fn new(
        outcome_action_hash: ActionHashB64,
        content: String,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_action_hash,
            content,
            creator_agent_pub_key,
            unix_timestamp,
            is_imported,
        }
    }
}
