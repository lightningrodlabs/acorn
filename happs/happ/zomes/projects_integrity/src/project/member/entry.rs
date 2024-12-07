use hdi::prelude::*;
use holo_hash::AgentPubKeyB64;

// This is a reference to the agent address for any users who have joined this DHT
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Member {
    pub agent_pub_key: AgentPubKeyB64,
}

impl Member {
    pub fn new(agent_pub_key: AgentPubKeyB64) -> Self {
        Self { agent_pub_key }
    }
}
