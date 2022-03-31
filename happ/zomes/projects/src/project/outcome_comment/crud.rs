use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

#[hdk_entry(id = "outcome_comment")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeComment {
    pub outcome_address: HeaderHashB64,
    pub content: String,
    pub agent_address: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeComment {
    pub fn new(
        outcome_address: HeaderHashB64,
        content: String,
        agent_address: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_address,
            content,
            agent_address,
            unix_timestamp,
            is_imported,
        }
    }
}

crud!(
    OutcomeComment,
    outcome_comment,
    "outcome_comment",
    get_peers_content,
    SignalType
);
