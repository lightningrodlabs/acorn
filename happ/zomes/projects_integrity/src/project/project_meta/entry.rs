use hdi::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};
use std::*;

use crate::ui_enum::UIEnum;

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
    pub priority_mode: PriorityMode,
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
        priority_mode: PriorityMode,
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
            priority_mode,
            top_priority_outcomes,
            is_migrated,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum PriorityMode {
    Universal,
    Vote,
}
impl From<UIEnum> for PriorityMode {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "Universal" => Self::Universal,
            "Vote" => Self::Vote,
            _ => Self::Vote,
        }
    }
}
impl From<PriorityMode> for UIEnum {
    fn from(priority_mode: PriorityMode) -> Self {
        Self(priority_mode.to_string())
    }
}
impl fmt::Display for PriorityMode {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
