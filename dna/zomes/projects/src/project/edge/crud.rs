use crate::{
    get_peers_content,
    project::{error::Error, validate::entry_from_element_create_only},
    SignalType,
};
use hdk_crud::{crud, WrappedHeaderHash};
use hdk::prelude::*;

// An edge. This is an arrow on the SoA Tree which directionally links
// two goals.
#[hdk_entry(id = "edge")]
#[derive(Clone, PartialEq)]
pub struct Edge {
    pub parent_address: WrappedHeaderHash,
    pub child_address: WrappedHeaderHash,
    pub randomizer: f64,
    pub is_imported: bool,
}

// can't be updated
impl TryFrom<&Element> for Edge {
    type Error = Error;
    fn try_from(element: &Element) -> Result<Self, Self::Error> {
        entry_from_element_create_only::<Edge>(element)
    }
}

impl Edge {
    pub fn new(
        parent_address: WrappedHeaderHash,
        child_address: WrappedHeaderHash,
        randomizer: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            parent_address,
            child_address,
            randomizer,
            is_imported,
        }
    }
}

fn convert_to_receiver_signal(signal: EdgeSignal) -> SignalType {
    SignalType::Edge(signal)
}

crud!(
    Edge,
    edge,
    "edge",
    get_peers_content,
    convert_to_receiver_signal
);
