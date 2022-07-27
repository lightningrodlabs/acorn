use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::{
    crud,
    modify_chain::{do_delete::DoDelete, do_fetch::DoFetch},
    retrieval::{
        fetch_entries::FetchEntries, fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry,
        inputs::FetchOptions,
    },
};
use holo_hash::ActionHashB64;
use projects_integrity::{project::outcome_member::entry::OutcomeMember, EntryTypes, LinkTypes};

crud!(
    OutcomeMember,
    EntryTypes,
    EntryTypes::OutcomeMember,
    LinkTypes,
    LinkTypes::All,
    outcome_member,
    "outcome_member",
    get_peers_content,
    SignalType
);

// DELETE
// clear all members
pub fn delete_outcome_members(address: ActionHashB64) -> ExternResult<Vec<ActionHashB64>> {
    let do_fetch = DoFetch {};
    let do_delete = DoDelete {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::All)?;
    Ok(do_fetch
        .do_fetch::<OutcomeMember, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            link_type_filter,
            None,
            get_outcome_member_path(LinkTypes::All)?,
        )?
        .into_iter()
        .filter(|wire_record| {
            // check whether the parent_action_hash or child_action_hash is equal to the given address.
            // If so, the connection is connected to the outcome being deleted.
            wire_record.entry.outcome_action_hash == address.clone()
        })
        .map(|wire_record| {
            let outcome_member_address = wire_record.action_hash;
            // delete the connection with this address
            // this will also trigger signals
            match do_delete.do_delete::<OutcomeMember, WasmError, SignalType>(
                outcome_member_address.clone(),
                "outcome_member".to_string(),
                Some(get_peers_content()?),
            ) {
                Ok(_) => Ok(outcome_member_address),
                Err(e) => Err(e),
            }
        })
        // filter out errors
        .filter_map(Result::ok)
        .collect())
}
