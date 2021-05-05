use crate::{
    get_peers_content,
    project::{error::Error, validate::entry_from_element_create_only},
    SignalType,
};
use dna_help::{crud, WrappedAgentPubKey, WrappedHeaderHash};
use hdk::prelude::*;

// The "Entry" in EntryPoint is not a reference to Holochain "Entries"
// it is rather the concept of an Entrance, as in a doorway, to the tree
#[hdk_entry(id = "entry_point")]
#[derive(Clone, PartialEq)]
pub struct EntryPoint {
    pub color: String,
    pub creator_address: WrappedAgentPubKey,
    pub created_at: f64,
    pub goal_address: WrappedHeaderHash,
    pub is_imported: bool,
}

impl EntryPoint {
    pub fn new(
        color: String,
        creator_address: WrappedAgentPubKey,
        created_at: f64,
        goal_address: WrappedHeaderHash,
        is_imported: bool,
      ) -> Self {
        Self {
          color,
          creator_address,
          created_at,
          goal_address,
          is_imported,
        }
    }
}

// can't be updated
impl TryFrom<&Element> for EntryPoint {
    type Error = Error;
    fn try_from(element: &Element) -> Result<Self, Self::Error> {
        entry_from_element_create_only::<EntryPoint>(element)
    }
}

fn convert_to_receiver_signal(signal: EntryPointSignal) -> SignalType {
    SignalType::EntryPoint(signal)
}

crud!(
    EntryPoint,
    entry_point,
    "entry_point",
    get_peers_content,
    convert_to_receiver_signal
);
