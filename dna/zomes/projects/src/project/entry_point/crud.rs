use crate::{
    get_peers_content,
    project::goal::crud::{fetch_goals, VecGoalWireEntry},
    SignalType,
};
use hdk::prelude::*;
use hdk_crud::{crud, FetchOptions, WrappedAgentPubKey, WrappedEntryHash, WrappedHeaderHash};

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

#[derive(Serialize, Deserialize, Debug)]
pub struct EntryPointDetails {
    pub entry_points: VecEntryPointWireEntry,
    pub goals: VecGoalWireEntry,
}

#[hdk_extern]
pub fn fetch_entry_point_details(_: ()) -> ExternResult<EntryPointDetails> {
    // get the list of entry points
    let entry_points = inner_fetch_entry_points(hdk_crud::FetchOptions::All, GetOptions::latest())?;

    // convert from header addresses to entry addresses
    let goal_entry_addresses = entry_points
        .0
        .clone()
        .iter()
        .map(|e| {
            let element = get(e.entry.goal_address.0.clone(), GetOptions::content())?;
            match element {
                Some(element) => match element.header().entry_hash() {
                    Some(entry_hash) => Ok(WrappedEntryHash::new(entry_hash.clone())),
                    None => Err(WasmError::Guest(
                        "there was no entry_hash on a header for a Goal specified as an entry_point"
                            .to_string(),
                    )),
                },
                None => Err(WasmError::Guest(
                        "there was no goal at the address specified by an entry point".to_string(),
                    ))
            }
        })
        .collect::<Vec<ExternResult<WrappedEntryHash>>>();

    // check if there are any errors and return the first error if there are any
    let any_error = goal_entry_addresses
        .clone()
        .into_iter()
        .find(|e| e.is_err());
    match any_error {
        Some(result_with_error) => Err(result_with_error.unwrap_err()),
        None => {
            // they are all fine so drop the Result layer
            let actual_addresses = goal_entry_addresses
                .into_iter()
                .filter_map(Result::ok)
                .collect::<Vec<WrappedEntryHash>>();
            // use the fetch_goals specific to get only these goals
            let goals = fetch_goals(FetchOptions::Specific(actual_addresses))?;
            Ok(EntryPointDetails {
                entry_points,
                goals,
            })
        }
    }
}
