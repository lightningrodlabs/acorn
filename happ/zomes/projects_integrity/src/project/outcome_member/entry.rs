use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};

// a relationship between an Outcome and an Agent
// representing roughly the idea of someone being "assigned to"
// or "responsible for" or "working on"
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeMember {
    pub outcome_action_hash: ActionHashB64,
    // the "assignee"
    pub member_agent_pub_key: AgentPubKeyB64,
    // the person who authored this entry
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeMember {
    pub fn new(
        outcome_action_hash: ActionHashB64,
        member_agent_pub_key: AgentPubKeyB64,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_action_hash,
            member_agent_pub_key,
            creator_agent_pub_key,
            unix_timestamp,
            is_imported,
        }
    }
}
