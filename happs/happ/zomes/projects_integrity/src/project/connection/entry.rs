use hdi::prelude::*;
use holo_hash::ActionHashB64;

// An connection. This is an arrow on the SoA Tree which directionally links
// two outcomes.
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Connection {
    pub parent_action_hash: ActionHashB64,
    pub child_action_hash: ActionHashB64,
    pub sibling_order: i32,
    pub randomizer: i64,
    pub is_imported: bool,
}

impl Connection {
    pub fn new(
        parent_action_hash: ActionHashB64,
        child_action_hash: ActionHashB64,
        sibling_order: i32,
        randomizer: i64,
        is_imported: bool,
    ) -> Self {
        Self {
            parent_action_hash,
            child_action_hash,
            sibling_order,
            randomizer,
            is_imported,
        }
    }
}