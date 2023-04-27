use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};
use std::*;

use crate::ui_enum::UIEnum;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, SerializedBytes)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum LayeringAlgorithm {
    LongestPath,
    CoffmanGraham,
}

impl From<UIEnum> for LayeringAlgorithm {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "LongestPath" => Self::LongestPath,
            "CoffmanGraham" => Self::CoffmanGraham,
            _ => Self::CoffmanGraham,
        }
    }
}
impl From<LayeringAlgorithm> for UIEnum {
    fn from(layering_algorithm: LayeringAlgorithm) -> Self {
        Self(layering_algorithm.to_string())
    }
}
impl fmt::Display for LayeringAlgorithm {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct ProjectMeta {
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub created_at: f64,
    pub name: String,
    pub image: Option<String>,
    pub passphrase: String,
    pub is_imported: bool,
    pub layering_algorithm: LayeringAlgorithm,
    pub top_priority_outcomes: Vec<ActionHashB64>,
    pub is_migrated: Option<String>, // the string will represent the version migrated to
}

impl ProjectMeta {
    pub fn new(
        creator_agent_pub_key: AgentPubKeyB64,
        created_at: f64,
        name: String,
        image: Option<String>,
        passphrase: String,
        is_imported: bool,
        layering_algorithm: LayeringAlgorithm,
        top_priority_outcomes: Vec<ActionHashB64>,
        is_migrated: Option<String>,
    ) -> Self {
        Self {
            creator_agent_pub_key,
            created_at,
            name,
            image,
            passphrase,
            is_imported,
            layering_algorithm,
            top_priority_outcomes,
            is_migrated,
        }
    }
}
