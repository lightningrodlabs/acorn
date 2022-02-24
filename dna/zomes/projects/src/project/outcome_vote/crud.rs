use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

#[hdk_entry(id = "outcome_vote")]
#[derive(Clone, PartialEq)]
pub struct OutcomeVote {
    pub outcome_address: HeaderHashB64,
    pub urgency: f64,
    pub importance: f64,
    pub impact: f64,
    pub effort: f64,
    pub agent_address: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeVote {
    pub fn new(
        outcome_address: HeaderHashB64,
        urgency: f64,
        importance: f64,
        impact: f64,
        effort: f64,
        agent_address: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_address,
            urgency,
            importance,
            impact,
            effort,
            agent_address,
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