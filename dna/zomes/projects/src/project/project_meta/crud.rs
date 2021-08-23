use crate::{
  get_peers_content,
  project::{
    error::Error,
    validate::entry_from_element_create_or_update,
    goal::crud::UIEnum
  },
  SignalType,
};
use dna_help::{crud, WrappedAgentPubKey, WrappedEntryHash, WrappedHeaderHash};
use hdk::prelude::*;
use std::*;

#[hdk_entry(id = "project_meta")]
#[derive(Clone, PartialEq)]
pub struct ProjectMeta {
  pub creator_address: WrappedAgentPubKey,
  pub created_at: f64,
  pub name: String,
  pub image: Option<String>,
  pub passphrase: String,
  pub is_imported: bool,
  pub priority_mode: PriorityMode,
  pub top_priority_goals: Vec<WrappedHeaderHash>
}

impl ProjectMeta {
  pub fn new(
    creator_address: WrappedAgentPubKey,
    created_at: f64,
    name: String,
    image: Option<String>,
    passphrase: String,
    is_imported: bool,
    priority_mode: PriorityMode,
    top_priority_goals: Vec<WrappedHeaderHash>
  ) -> Self {
    Self {
      creator_address,
      created_at,
      name,
      image,
      passphrase,
      is_imported,
      priority_mode,
      top_priority_goals,
    }
  }
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum PriorityMode {
  Universal,
  Vote
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

#[hdk_extern]
pub fn simple_create_project_meta(entry: ProjectMeta) -> ExternResult<ProjectMetaWireEntry> {
  // no project_meta entry should exist at least
  // that we can know about
  match inner_fetch_project_metas(GetOptions::latest())?.0.len() {
    0 => {},
    _ => return Err(WasmError::Guest(Error::OnlyOneOfEntryType.to_string())),
  };
  let address = create_entry(&entry)?;
  let entry_hash = hash_entry(&entry)?;
  let path = Path::from(PROJECT_META_PATH);
  path.ensure()?;
  let path_hash = path.hash()?;
  create_link(path_hash, entry_hash.clone(), ())?;
  let wire_entry = ProjectMetaWireEntry {
    entry,
    address: WrappedHeaderHash(address),
    entry_address: WrappedEntryHash(entry_hash),
  };
  Ok(wire_entry)
}

// READ
#[hdk_extern]
pub fn fetch_project_meta(_: ()) -> ExternResult<ProjectMetaWireEntry> {
  match inner_fetch_project_metas(GetOptions::latest())?.0.first() {
    Some(wire_entry) => Ok(wire_entry.to_owned()),
    None => Err(WasmError::Guest("no project meta exists".into())),
  }
}

// Since get_links can't be controlled with GetOptions right
// now, we need to check the Path instead, and use GetOptions::latest
// this is used while trying to join a project
#[hdk_extern]
pub fn check_project_meta_exists(_: ()) -> ExternResult<bool> {
  let path = Path::from(PROJECT_META_PATH);
  Ok(get(path.hash()?, GetOptions::latest())?.is_some())
}


