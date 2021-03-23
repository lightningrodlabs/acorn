use crate::{get_peers_content, SignalType};
use dna_help::{crud, WrappedAgentPubKey};
use hdk::prelude::*;

#[hdk_entry(id = "project_meta")]
#[derive(Clone, PartialEq)]
pub struct ProjectMeta {
    pub creator_address: WrappedAgentPubKey,
    pub created_at: f64,
    pub name: String,
    pub image: Option<String>,
    pub passphrase: String,
}

fn convert_to_receiver_signal(signal: ProjectMetaSignal) -> SignalType {
    SignalType::ProjectMeta(signal)
}

crud!(
    ProjectMeta,
    project_meta,
    "project_meta",
    get_peers_content,
    convert_to_receiver_signal
);

// READ
#[hdk_extern]
pub fn fetch_project_meta(_: ()) -> ExternResult<ProjectMetaWireEntry> {
    match inner_fetch_project_metas(GetOptions::latest())?.0.first() {
        Some(wire_entry) => Ok(wire_entry.to_owned()),
        None => Err(WasmError::Guest("no project meta exists".into())),
    }
}
