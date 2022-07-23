use super::{small_scope::SmallScope, uncertain_scope::UncertainScope};
use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};

// an Outcome Card. This is a card on the SoA Tree which can be small or non-small, complete or
// incomplete, certain or uncertain, and contains text content.
// user hash and unix timestamp are included to prevent hash collisions.
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Outcome {
    pub content: String,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub editor_agent_pub_key: Option<AgentPubKeyB64>,
    pub timestamp_created: f64,
    pub timestamp_updated: Option<f64>,
    pub scope: Scope,
    pub tags: Vec<ActionHashB64>,
    pub description: String,
    pub is_imported: bool,
    pub github_link: String,
}

impl Outcome {
    pub fn new(
        content: String,
        creator_agent_pub_key: AgentPubKeyB64,
        editor_agent_pub_key: Option<AgentPubKeyB64>,
        timestamp_created: f64,
        timestamp_updated: Option<f64>,
        scope: Scope,
        tags: Vec<ActionHashB64>,
        description: String,
        is_imported: bool,
        github_link: String,
    ) -> Self {
        Self {
            content,
            creator_agent_pub_key,
            editor_agent_pub_key,
            timestamp_created,
            timestamp_updated,
            scope,
            tags,
            description,
            is_imported,
            github_link,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
pub enum Scope {
    Small(SmallScope),
    Uncertain(UncertainScope),
}
