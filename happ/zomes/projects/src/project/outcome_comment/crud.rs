use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

#[hdk_entry(id = "outcome_comment")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeComment {
    pub outcome_header_hash: HeaderHashB64,
    pub content: String,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeComment {
    pub fn new(
        outcome_header_hash: HeaderHashB64,
        content: String,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_header_hash,
            content,
            creator_agent_pub_key,
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
