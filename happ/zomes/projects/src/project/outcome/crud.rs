use crate::project::{
    connection::crud::get_connection_path, entry_point::crud::get_entry_point_path,
    outcome_comment::crud::get_outcome_comment_path, outcome_member::crud::delete_outcome_members,
    outcome_vote::crud::get_outcome_vote_path,
};
use crate::ui_enum::UIEnum;
use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::{
    crud, retrieval::inputs::FetchOptions, signals::ActionType, wire_record::WireRecord,
};
use hdk_crud::{
    modify_chain::{
        do_create::{DoCreate, TypedPathOrEntryHash},
        do_delete::DoDelete,
        do_fetch::DoFetch,
    },
    retrieval::{
        fetch_entries::FetchEntries, fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry,
    },
}; //may want to do the mock thing
use holo_hash::{ActionHashB64};
use projects_integrity::{
    project::{
        connection::entry::Connection, entry_point::entry::EntryPoint, outcome::entry::Outcome,
        outcome_comment::entry::OutcomeComment, outcome_member::entry::OutcomeMember,
        outcome_vote::entry::OutcomeVote,
    },
    EntryTypes, LinkTypes,
};
use std::fmt;

crud!(
    Outcome,
    EntryTypes,
    EntryTypes::Outcome,
    LinkTypes,
    LinkTypes::All,
    outcome,
    "outcome",
    get_peers_content,
    SignalType
);

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum RelationInput {
    ExistingOutcomeAsChild,
    ExistingOutcomeAsParent,
}
impl From<UIEnum> for RelationInput {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "ExistingOutcomeAsChild" => Self::ExistingOutcomeAsChild,
            "ExistingOutcomeAsParent" => Self::ExistingOutcomeAsParent,
            _ => Self::ExistingOutcomeAsChild,
        }
    }
}
impl From<RelationInput> for UIEnum {
    fn from(relation_input: RelationInput) -> Self {
        Self(relation_input.to_string())
    }
}
impl fmt::Display for RelationInput {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct LinkedOutcomeDetails {
    outcome_action_hash: ActionHashB64,
    relation: RelationInput,
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CreateOutcomeWithConnectionInput {
    entry: Outcome,
    maybe_linked_outcome: Option<LinkedOutcomeDetails>,
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CreateOutcomeWithConnectionOutput {
    outcome: WireRecord<Outcome>,
    maybe_connection: Option<WireRecord<Connection>>,
}

// custom signal type
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutcomeWithConnectionSignal {
    entry_type: String,
    action: ActionType,
    data: CreateOutcomeWithConnectionOutput,
}

#[hdk_extern]
pub fn create_outcome_with_connection(
    // TODO: may want to consider having a handler so can pass in the do_create struct for testing
    input: CreateOutcomeWithConnectionInput,
) -> ExternResult<CreateOutcomeWithConnectionOutput> {
    // false to say don't send a signal
    let do_create = DoCreate {};
    let full_entry = EntryTypes::Outcome(input.entry.clone());
    let wire_record = do_create
        .do_create::<EntryTypes, Outcome, WasmError, SignalType, LinkTypes>(
            full_entry,
            input.entry.clone(),
            Some(TypedPathOrEntryHash::TypedPath(get_outcome_path(
                LinkTypes::All,
            )?)),
            "outcome".to_string(),
            LinkTypes::All,
            None,
            None,
        )?;
    let new_outcome_action_hash = wire_record.action_hash.clone();
    let maybe_connection: Option<WireRecord<Connection>> = match input.maybe_linked_outcome {
        Some(linked_outcome_details) => {
            let (parent_action_hash, child_action_hash) = match linked_outcome_details.relation {
                // new outcome becomes parent
                RelationInput::ExistingOutcomeAsChild => (
                    new_outcome_action_hash,
                    linked_outcome_details.outcome_action_hash,
                ),
                // new outcome becomes child
                RelationInput::ExistingOutcomeAsParent => (
                    linked_outcome_details.outcome_action_hash,
                    new_outcome_action_hash,
                ),
            };
            let random = sys_time()?;
            let r0 = random.as_millis();
            let connection = Connection {
                parent_action_hash,
                child_action_hash,
                randomizer: r0,
                is_imported: false,
            };
            let full_entry = EntryTypes::Connection(connection.clone());
            let connection_wire_record = do_create
                .do_create::<EntryTypes, Connection, WasmError, SignalType, LinkTypes>(
                    full_entry,
                    connection,
                    Some(TypedPathOrEntryHash::TypedPath(get_connection_path(
                        LinkTypes::All,
                    )?)),
                    "connection".to_string(),
                    LinkTypes::All,
                    None,
                    None,
                )?;
            Some(connection_wire_record)
        }
        None => None,
    };

    let outcome_with_connection = CreateOutcomeWithConnectionOutput {
        outcome: wire_record.clone(),
        maybe_connection,
    };
    let signal = SignalType::OutcomeWithConnection(OutcomeWithConnectionSignal {
        entry_type: "outcome_with_connection".to_string(),
        action: ActionType::Create,
        data: outcome_with_connection.clone(),
    });
    let payload = ExternIO::encode(signal).map_err(|e| wasm_error!(e))?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;

    Ok(outcome_with_connection)
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DeleteOutcomeFullyResponse {
    outcome_action_hash: ActionHashB64,
    deleted_connections: Vec<ActionHashB64>,
    deleted_outcome_members: Vec<ActionHashB64>,
    deleted_outcome_votes: Vec<ActionHashB64>,
    deleted_outcome_comments: Vec<ActionHashB64>,
    deleted_entry_points: Vec<ActionHashB64>,
}

// custom signal type
#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct DeleteOutcomeFullySignal {
    entry_type: String,
    action: ActionType,
    data: DeleteOutcomeFullyResponse,
}

#[hdk_extern]
pub fn delete_outcome_fully(address: ActionHashB64) -> ExternResult<DeleteOutcomeFullyResponse> {
    let do_delete = DoDelete {};
    do_delete.do_delete::<Outcome, WasmError, SignalType>(
        address.clone(),
        "outcome".to_string(),
        None,
    )?;
    let do_fetch = DoFetch {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::All)?;
    let deleted_connections = do_fetch
        .do_fetch::<Connection, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            link_type_filter.clone(),
            None,
            get_connection_path(LinkTypes::All)?,
        )?
        .into_iter()
        .filter(|wire_record| {
            // check whether the parent_action_hash or child_action_hash is equal to the given address.
            // If so, the connection is connected to the outcome being deleted.
            wire_record.entry.child_action_hash == address.clone()
                || wire_record.entry.parent_action_hash == address.clone()
        })
        .map(|wire_record| {
            let connection_address = wire_record.action_hash;
            match do_delete.do_delete::<Connection, WasmError, SignalType>(
                connection_address.clone(),
                "connection".to_string(),
                None,
            ) {
                Ok(_) => Ok(connection_address),
                Err(e) => Err(e),
            }
        })
        // filter out errors
        .filter_map(Result::ok)
        .collect();

    let deleted_outcome_members = delete_outcome_members(address.clone())?;

    let deleted_outcome_votes = do_fetch
        .do_fetch::<OutcomeVote, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            link_type_filter.clone(),
            None,
            get_outcome_vote_path(LinkTypes::All)?,
        )?
        .into_iter()
        .filter(|wire_record| wire_record.entry.outcome_action_hash == address.clone())
        .map(|wire_record| {
            let outcome_vote_address = wire_record.action_hash;
            match do_delete.do_delete::<OutcomeVote, WasmError, SignalType>(
                outcome_vote_address.clone(),
                "outcome_vote".to_string(),
                None,
            ) {
                Ok(_) => Ok(outcome_vote_address),
                Err(e) => Err(e),
            }
        })
        // filter out errors
        .filter_map(Result::ok)
        .collect();

    let deleted_outcome_comments =
        // inner_fetch_outcome_comments(FetchOptions::All, GetOptions::content())?
        do_fetch.do_fetch::<OutcomeComment, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            link_type_filter.clone(),
            None,
            get_outcome_comment_path(LinkTypes::All)?,
        )?
            .into_iter()
            .filter(|wire_record| wire_record.entry.outcome_action_hash == address)
            .map(|wire_record| {
                let outcome_comment_address = wire_record.action_hash;
                match do_delete.do_delete::<OutcomeComment, WasmError, SignalType>(
                    outcome_comment_address.clone(),
                    "outcome_comment".to_string(),
                    None,
                ) {
                    Ok(_) => Ok(outcome_comment_address),
                    Err(e) => Err(e),
                }
            })
            // filter out errors
            .filter_map(Result::ok)
            .collect();

    let deleted_entry_points = do_fetch
        .do_fetch::<EntryPoint, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            link_type_filter,
            None,
            get_entry_point_path(LinkTypes::All)?,
        )?
        .into_iter()
        .filter(|wire_record| wire_record.entry.outcome_action_hash == address)
        .map(|wire_record| {
            let entry_point_address = wire_record.action_hash;
            match do_delete.do_delete::<EntryPoint, WasmError, SignalType>(
                entry_point_address.clone(),
                "entry_point".to_string(),
                None,
            ) {
                Ok(_) => Ok(entry_point_address),
                Err(e) => Err(e),
            }
        })
        // filter out errors
        .filter_map(Result::ok)
        .collect();

    let delete_response = DeleteOutcomeFullyResponse {
        outcome_action_hash: address,
        deleted_connections,
        deleted_outcome_members,
        deleted_outcome_votes,
        deleted_outcome_comments,
        deleted_entry_points,
    };

    let signal = SignalType::DeleteOutcomeFully(DeleteOutcomeFullySignal {
        entry_type: "delete_outcome_fully".to_string(),
        action: ActionType::Delete,
        data: delete_response.clone(),
    });
    let payload = ExternIO::encode(signal).map_err(|e| wasm_error!(e))?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;

    Ok(delete_response)
}

// TODO: finish get outcome history
#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone)]
pub struct GetHistoryResponse {
    entries: Vec<Outcome>,
    members: Vec<Vec<OutcomeMember>>,
    address: ActionHashB64,
}

// pub fn history_of_outcome(address: ActionHashB64) -> ExternResult<GetHistoryResponse> {
//   let anchor_address = Entry::App(
//     "anchor".into(),       // app entry type
//     "outcome_members".into(), // app entry value
//   )
//   .address();
//   // return all the Outcome objects from the entries linked to the connection anchor (drop entries with wrong type)
//   let members = get_links!(
//     &anchor_address,
//     LinkMatch::Exactly("anchor->outcome_member"), // the link type to match
//     LinkMatch::Any,
//   )?
//   // scoop all these entries up into an array and return it
//   .addresses()
//   .into_iter()
//   .map(|member_address: ActionHashB64| {
//     if let Ok(Some(entry_history)) = hdk::api::get_entry_history(&member_address) {
//       Some(
//         entry_history
//           .items
//           .into_iter()
//           .map(|item| {
//             if let Some(App(_, value_entry)) = item.entry {
//               match serde_json::from_str::<OutcomeMember>(&Into::<String>::into(value_entry)).ok() {
//                 Some(outcome_member) => {
//                   // filter down to only Outcome Members that are associated with the requested Outcome
//                   if outcome_member.outcome_action_hash == address {
//                     Ok(outcome_member)
//                   } else {
//                     Err(ZomeApiError::Internal("error".into()))
//                   }
//                 }
//                 None => Err(ZomeApiError::Internal("error".into())),
//               }
//             } else {
//               Err(ZomeApiError::Internal("error".into()))
//             }
//           })
//           .filter_map(Result::ok)
//           .collect(),
//       )
//     } else {
//       None
//     }
//   })
//   .filter_map(|op: Option<Vec<OutcomeMember>>| match op {
//     Some(vec) => {
//       if vec.len() > 0 {
//         Some(vec)
//       } else {
//         None
//       }
//     }
//     _ => None,
//   })
//   .collect();
//   if let Ok(Some(entry_history)) = hdk::api::get_entry_history(&address) {
//     Ok(GetHistoryResponse {
//       entries: entry_history
//         .items
//         .into_iter()
//         .map(|item| {
//           if let Some(App(_, value_entry)) = item.entry {
//             match serde_json::from_str::<Outcome>(&Into::<String>::into(value_entry)).ok() {
//               Some(outcome) => Ok(outcome),
//               None => Err(ZomeApiError::Internal("error".into())),
//             }
//           } else {
//             Err(ZomeApiError::Internal("error".into()))
//           }
//         })
//         .filter_map(Result::ok)
//         .collect(),
//       members: members,
//       address: address,
//     })
//   } else {
//     Err(ZomeApiError::Internal("error".into()))
//   }
// }
