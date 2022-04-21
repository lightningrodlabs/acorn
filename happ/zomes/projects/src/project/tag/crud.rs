use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;

// An connection. This is an arrow on the SoA Tree which directionally links
// two outcomes.
#[hdk_entry(id = "tag")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Tag {
    pub background_color: String,
    pub text: String,
}

impl Tag {
    pub fn new(background_color: String, text: String) -> Self {
        Self {
            background_color,
            text,
        }
    }
}

crud!(
    Tag,
    tag,
    "tag",
    get_peers_content,
    SignalType
);
