use hdk::prelude::*;
use holo_hash::EntryHashB64;

#[derive(Debug, PartialEq, Serialize, Deserialize, SerializedBytes)]
pub enum FetchOptions {
    All,
    Specific(Vec<EntryHashB64>),
}
