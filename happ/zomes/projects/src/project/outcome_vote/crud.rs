use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

#[hdk_entry(id = "outcome_vote")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeVote {
    pub outcome_header_hash: HeaderHashB64,
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
        outcome_header_hash: HeaderHashB64,
        urgency: f64,
        importance: f64,
        impact: f64,
        effort: f64,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_header_hash,
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

crud!(
    OutcomeVote,
    outcome_vote,
    "outcome_vote",
    get_peers_content,
    SignalType
);
