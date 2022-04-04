use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use holo_hash::HeaderHashB64;

// An connection. This is an arrow on the SoA Tree which directionally links
// two outcomes.
#[hdk_entry(id = "connection")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Connection {
    pub parent_header_hash: HeaderHashB64,
    pub child_header_hash: HeaderHashB64,
    pub randomizer: i64,
    pub is_imported: bool,
}

impl Connection {
    pub fn new(
        parent_header_hash: HeaderHashB64,
        child_header_hash: HeaderHashB64,
        randomizer: i64,
        is_imported: bool,
    ) -> Self {
        Self {
            parent_header_hash,
            child_header_hash,
            randomizer,
            is_imported,
        }
    }
}

crud!(
    Connection,
    connection,
    "connection",
    get_peers_content,
    SignalType
);
