use crate::{
  get_peers_content,
  project::{error::Error, validate::entry_from_element_create_or_update},
  SignalType,
};
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

impl ProjectMeta {
  pub fn new(
    creator_address: WrappedAgentPubKey,
    created_at: f64,
    name: String,
    image: Option<String>,
    passphrase: String,
  ) -> Self {
    Self {
      creator_address,
      created_at,
      name,
      image,
      passphrase,
    }
  }
}

// can be updated
impl TryFrom<&Element> for ProjectMeta {
  type Error = Error;
  fn try_from(element: &Element) -> Result<Self, Self::Error> {
    entry_from_element_create_or_update::<ProjectMeta>(element)
  }
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
