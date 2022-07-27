use crate::{get_peers_content, project::error::Error, SignalType};
use hdk::prelude::*;
use hdk_crud::{
    crud,
    modify_chain::do_fetch::DoFetch,
    retrieval::{
        fetch_entries::FetchEntries, fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry,
        inputs::FetchOptions,
    },
    wire_record::WireRecord,
};
use holo_hash::{ActionHashB64, EntryHashB64};
use std::*;

use projects_integrity::{project::project_meta::entry::ProjectMeta, EntryTypes, LinkTypes};

crud!(
    ProjectMeta,
    EntryTypes,
    EntryTypes::ProjectMeta,
    LinkTypes,
    LinkTypes::All,
    project_meta,
    "project_meta",
    get_peers_content,
    SignalType
);

#[hdk_extern]
pub fn simple_create_project_meta(entry: ProjectMeta) -> ExternResult<WireRecord<ProjectMeta>> {
    // no project_meta entry should exist at least
    // that we can know about
    let do_fetch = DoFetch {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::All)?;
    match do_fetch
        .do_fetch::<ProjectMeta, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::latest(),
            link_type_filter,
            None,
            get_project_meta_path(LinkTypes::All)?,
        )?
        .len()
    {
        0 => {}
        _ => {
            return Err(wasm_error!(WasmErrorInner::Guest(
                Error::OnlyOneOfEntryType.to_string()
            )))
        }
    };
    let entry_hash = hash_entry(&entry)?;
    let address = create_entry(EntryTypes::ProjectMeta(entry.clone()))?;
    let path = Path::from(PROJECT_META_PATH).typed(LinkTypes::All)?;
    path.ensure()?;
    let path_hash = path.path_entry_hash()?;
    create_link(
        path_hash,
        entry_hash.clone(),
        LinkTypes::All,
        LinkTag::from(()),
    )?;
    let time = sys_time()?;
    let wire_entry: WireRecord<ProjectMeta> = WireRecord {
        entry,
        action_hash: ActionHashB64::new(address),
        entry_hash: EntryHashB64::new(entry_hash),
        created_at: time,
        updated_at: time,
    };
    Ok(wire_entry)
}

// READ
#[hdk_extern]
pub fn fetch_project_meta(_: ()) -> ExternResult<WireRecord<ProjectMeta>> {
    let do_fetch = DoFetch {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::All)?;
    match do_fetch
        .do_fetch::<ProjectMeta, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::latest(),
            link_type_filter,
            None,
            get_project_meta_path(LinkTypes::All)?,
        )?
        .first()
    {
        Some(wire_entry) => Ok(wire_entry.to_owned()),
        None => Err(wasm_error!(WasmErrorInner::Guest(
            "no project meta exists".into()
        ))),
    }
}

// Since get_links can't be controlled with GetOptions right
// now, we need to check the Path instead, and use GetOptions::latest
// this is used while trying to join a project
#[hdk_extern]
pub fn check_project_meta_exists(_: ()) -> ExternResult<bool> {
    let path = Path::from(PROJECT_META_PATH);
    Ok(get(path.path_entry_hash()?, GetOptions::latest())?.is_some())
}
