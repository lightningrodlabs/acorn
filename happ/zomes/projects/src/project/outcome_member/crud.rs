use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::{
    chain_actions::{delete_action::DeleteAction, fetch_action::FetchAction},
    crud,
    retrieval::{
        fetch_entries::FetchEntries, fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry,
        inputs::FetchOptions,
    },
};
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

// a relationship between an Outcome and an Agent
// representing roughly the idea of someone being "assigned to"
// or "responsible for" or "working on"
#[hdk_entry(id = "outcome_member")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct OutcomeMember {
    pub outcome_header_hash: HeaderHashB64,
    // the "assignee"
    pub member_agent_pub_key: AgentPubKeyB64,
    // the person who authored this entry
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl OutcomeMember {
    pub fn new(
        outcome_header_hash: HeaderHashB64,
        member_agent_pub_key: AgentPubKeyB64,
        creator_agent_pub_key: AgentPubKeyB64,
        unix_timestamp: f64,
        is_imported: bool,
    ) -> Self {
        Self {
            outcome_header_hash,
            member_agent_pub_key,
            creator_agent_pub_key,
            unix_timestamp,
            is_imported,
        }
    }
}

crud!(
    OutcomeMember,
    outcome_member,
    "outcome_member",
    get_peers_content,
    SignalType
);

// DELETE
// clear all members
pub fn delete_outcome_members(address: HeaderHashB64) -> ExternResult<Vec<HeaderHashB64>> {
    let fetch_action = FetchAction {};
    let delete_action = DeleteAction {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    Ok(fetch_action
        .fetch_action::<OutcomeMember, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            get_outcome_member_path(),
        )?
        .into_iter()
        .filter(|wire_element| {
            // check whether the parent_header_hash or child_header_hash is equal to the given address.
            // If so, the connection is connected to the outcome being deleted.
            wire_element.entry.outcome_header_hash == address.clone()
        })
        .map(|wire_element| {
            let outcome_member_address = wire_element.header_hash;
            // delete the connection with this address
            // this will also trigger signals
            match delete_action.delete_action::<OutcomeMember, WasmError, SignalType>(
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
