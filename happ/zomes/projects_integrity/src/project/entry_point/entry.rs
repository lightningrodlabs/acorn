use hdi::prelude::*;
use holo_hash::{AgentPubKeyB64, ActionHashB64};

// The "Entry" in EntryPoint is not a reference to Holochain "Entries"
// it is rather the concept of an Entrance, as in a doorway, to the tree
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct EntryPoint {
    pub color: String,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub created_at: f64,
    pub outcome_action_hash: ActionHashB64,
    pub is_imported: bool,
}

impl EntryPoint {
    pub fn new(
        color: String,
        creator_agent_pub_key: AgentPubKeyB64,
        created_at: f64,
        outcome_action_hash: ActionHashB64,
        is_imported: bool,
    ) -> Self {
        Self {
            color,
            creator_agent_pub_key,
            created_at,
            outcome_action_hash,
            is_imported,
        }
    }
}
