use crate::{get_peers_content, project::outcome::crud::fetch_outcomes, SignalType};
use hdk::prelude::*;
use hdk_crud::{crud, retrieval::inputs::FetchOptions, wire_record::WireRecord};
use holo_hash::{EntryHashB64};

use projects_integrity::{
    project::{entry_point::entry::EntryPoint, outcome::entry::Outcome},
    EntryTypes, LinkTypes,
};

crud!(
    EntryPoint,
    EntryTypes,
    EntryTypes::EntryPoint,
    LinkTypes,
    LinkTypes::All,
    entry_point,
    "entry_point",
    get_peers_content,
    SignalType
);

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EntryPointDetails {
    pub entry_points: Vec<WireRecord<EntryPoint>>,
    pub outcomes: Vec<WireRecord<Outcome>>,
}

#[hdk_extern]
pub fn fetch_entry_point_details(_: ()) -> ExternResult<EntryPointDetails> {
    // get the list of entry points
    let entry_points = fetch_entry_points(FetchOptions::All)?;

    // convert from header addresses to entry addresses
    let outcome_entry_addresses = entry_points
        .clone()
        .iter()
        .map(|e| {
            let element = get(
                ActionHash::from(e.entry.outcome_action_hash.clone()),
                GetOptions::content(),
            )?;
            match element {
                Some(element) => match element.action().entry_hash() {
                    Some(entry_hash) => Ok(EntryHashB64::new(entry_hash.clone())),
                    None => Err(wasm_error!(WasmErrorInner::Guest(
                        "there was no entry_hash on a header for a Outcome specified as an entry_point"
                            .to_string(),
                    ))),
                },
                None => Err(wasm_error!(WasmErrorInner::Guest(
                        "there was no outcome at the address specified by an entry point".to_string(),
                    )))
            }
        })
        .collect::<Vec<ExternResult<EntryHashB64>>>();

    // check if there are any errors and return the first error if there are any
    let any_error = outcome_entry_addresses
        .clone()
        .into_iter()
        .find(|e| e.is_err());
    match any_error {
        Some(result_with_error) => Err(result_with_error.unwrap_err()),
        None => {
            // they are all fine so drop the Result layer
            let actual_addresses = outcome_entry_addresses
                .into_iter()
                .filter_map(Result::ok)
                .collect::<Vec<EntryHashB64>>();
            // use the fetch_outcomes specific to get only these outcomes
            let outcomes = fetch_outcomes(FetchOptions::Specific(actual_addresses))?;
            Ok(EntryPointDetails {
                entry_points,
                outcomes,
            })
        }
    }
}
