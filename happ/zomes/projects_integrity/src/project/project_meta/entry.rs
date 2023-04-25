use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};
use std::*;

use crate::ui_enum::UIEnum;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, SerializedBytes)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum LayoutAlgorithm {
    Simplex,
    LongestPath,
    CoffmanGraham,
}

impl From<UIEnum> for LayoutAlgorithm {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "Simplex" => Self::Simplex,
            "LongestPath" => Self::LongestPath,
            "CoffmanGraham" => Self::CoffmanGraham,
            _ => Self::Simplex,
        }
    }
}
impl From<LayoutAlgorithm> for UIEnum {
    fn from(layout_algorithm: LayoutAlgorithm) -> Self {
        Self(layout_algorithm.to_string())
    }
}
impl fmt::Display for LayoutAlgorithm {
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
    pub layout_algorithm: LayoutAlgorithm,
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
        layout_algorithm: LayoutAlgorithm,
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
            layout_algorithm,
            top_priority_outcomes,
            is_migrated,
        }
    }
}
