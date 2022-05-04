use crate::project::{
    connection::crud::{get_connection_path, Connection},
    entry_point::crud::{get_entry_point_path, EntryPoint},
    outcome_comment::crud::{get_outcome_comment_path, OutcomeComment},
    outcome_member::crud::{delete_outcome_members, OutcomeMember},
    outcome_vote::crud::{get_outcome_vote_path, OutcomeVote},
};
use crate::ui_enum::UIEnum;
use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::{
    chain_actions::{
        create_action::{CreateAction, PathOrEntryHash},
        delete_action::DeleteAction,
        fetch_action::FetchAction,
    },
    retrieval::{
        fetch_entries::FetchEntries, fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry,
    },
}; //may want to do the mock thing
use hdk_crud::{
    crud, retrieval::inputs::FetchOptions, signals::ActionType, wire_element::WireElement,
};
use holo_hash::{AgentPubKeyB64, HeaderHashB64};
use std::fmt;

use super::{small_scope::SmallScope, uncertain_scope::UncertainScope};

// A Outcome Card. This is a card on the SoA Tree which can be small or non-small, complete or
// incomplete, certain or uncertain, and contains text content.
// user hash and unix timestamp are included to prevent hash collisions.
#[hdk_entry(id = "outcome")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Outcome {
    pub content: String,
    pub creator_agent_pub_key: AgentPubKeyB64,
    pub editor_agent_pub_key: Option<AgentPubKeyB64>,
    pub timestamp_created: f64,
    pub timestamp_updated: Option<f64>,
    pub scope: Scope,
    pub tags: Vec<HeaderHashB64>,
    pub description: String,
    pub is_imported: bool,
    pub github_link: String,
}

impl Outcome {
    pub fn new(
        content: String,
        creator_agent_pub_key: AgentPubKeyB64,
        editor_agent_pub_key: Option<AgentPubKeyB64>,
        timestamp_created: f64,
        timestamp_updated: Option<f64>,
        scope: Scope,
        tags: Vec<HeaderHashB64>,
        description: String,
        is_imported: bool,
        github_link: String,
    ) -> Self {
        Self {
            content,
            creator_agent_pub_key,
            editor_agent_pub_key,
            timestamp_created,
            timestamp_updated,
            scope,
            tags,
            description,
            is_imported,
            github_link,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
pub enum Scope {
    Small(SmallScope),
    Uncertain(UncertainScope),
}

crud!(Outcome, outcome, "outcome", get_peers_content, SignalType);

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
    outcome_header_hash: HeaderHashB64,
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
    outcome: WireElement<Outcome>,
    maybe_connection: Option<WireElement<Connection>>,
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
    // TODO: may want to consider having a handler so can pass in the create_action struct for testing
    input: CreateOutcomeWithConnectionInput,
) -> ExternResult<CreateOutcomeWithConnectionOutput> {
    // false to say don't send a signal
    let create_action = CreateAction {};
    let wire_element = create_action.create_action::<Outcome, WasmError, SignalType>(
        input.entry.clone(),
        Some(PathOrEntryHash::Path(get_outcome_path())),
        "outcome".to_string(),
        None,
        None,
    )?;
    let new_outcome_header_hash = wire_element.header_hash.clone();
    let maybe_connection: Option<WireElement<Connection>> = match input.maybe_linked_outcome {
        Some(linked_outcome_details) => {
            let (parent_header_hash, child_header_hash) = match linked_outcome_details.relation {
                // new outcome becomes parent
                RelationInput::ExistingOutcomeAsChild => (
                    new_outcome_header_hash,
                    linked_outcome_details.outcome_header_hash,
                ),
                // new outcome becomes child
                RelationInput::ExistingOutcomeAsParent => (
                    linked_outcome_details.outcome_header_hash,
                    new_outcome_header_hash,
                ),
            };
            let random = sys_time()?;
            let r0 = random.as_millis();
            let connection = Connection {
                parent_header_hash,
                child_header_hash,
                randomizer: r0,
                is_imported: false,
            };
            let connection_wire_element = create_action
                .create_action::<Connection, WasmError, SignalType>(
                    connection,
                    Some(PathOrEntryHash::Path(get_connection_path())),
                    "connection".to_string(),
                    None,
                    None,
                )?;
            Some(connection_wire_element)
        }
        None => None,
    };

    let outcome_with_connection = CreateOutcomeWithConnectionOutput {
        outcome: wire_element.clone(),
        maybe_connection,
    };
    let signal = SignalType::OutcomeWithConnection(OutcomeWithConnectionSignal {
        entry_type: "outcome_with_connection".to_string(),
        action: ActionType::Create,
        data: outcome_with_connection.clone(),
    });
    let payload = ExternIO::encode(signal)?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;

    Ok(outcome_with_connection)
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DeleteOutcomeFullyResponse {
    outcome_header_hash: HeaderHashB64,
    deleted_connections: Vec<HeaderHashB64>,
    deleted_outcome_members: Vec<HeaderHashB64>,
    deleted_outcome_votes: Vec<HeaderHashB64>,
    deleted_outcome_comments: Vec<HeaderHashB64>,
    deleted_entry_points: Vec<HeaderHashB64>,
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
pub fn delete_outcome_fully(address: HeaderHashB64) -> ExternResult<DeleteOutcomeFullyResponse> {
    let delete_action = DeleteAction {};
    delete_action.delete_action::<Outcome, WasmError, SignalType>(
        address.clone(),
        "outcome".to_string(),
        None,
    )?;
    let fetch_action = FetchAction {};
    let fetch_entries = FetchEntries {};
    let fetch_links = FetchLinks {};
    let get_latest = GetLatestEntry {};
    let deleted_connections = fetch_action
        .fetch_action::<Connection, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            get_connection_path(),
        )?
        .into_iter()
        .filter(|wire_element| {
            // check whether the parent_header_hash or child_header_hash is equal to the given address.
            // If so, the connection is connected to the outcome being deleted.
            wire_element.entry.child_header_hash == address.clone()
                || wire_element.entry.parent_header_hash == address.clone()
        })
        .map(|wire_element| {
            let connection_address = wire_element.header_hash;
            match delete_action.delete_action::<Connection, WasmError, SignalType>(
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

    let deleted_outcome_votes = fetch_action
        .fetch_action::<OutcomeVote, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            get_outcome_vote_path(),
        )?
        .into_iter()
        .filter(|wire_element| wire_element.entry.outcome_header_hash == address.clone())
        .map(|wire_element| {
            let outcome_vote_address = wire_element.header_hash;
            match delete_action.delete_action::<OutcomeVote, WasmError, SignalType>(
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
        fetch_action.fetch_action::<OutcomeComment, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            get_outcome_comment_path(),
        )?
            .into_iter()
            .filter(|wire_element| wire_element.entry.outcome_header_hash == address)
            .map(|wire_element| {
                let outcome_comment_address = wire_element.header_hash;
                match delete_action.delete_action::<OutcomeComment, WasmError, SignalType>(
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

    let deleted_entry_points = fetch_action
        .fetch_action::<EntryPoint, WasmError>(
            &fetch_entries,
            &fetch_links,
            &get_latest,
            FetchOptions::All,
            GetOptions::content(),
            get_entry_point_path(),
        )?
        .into_iter()
        .filter(|wire_element| wire_element.entry.outcome_header_hash == address)
        .map(|wire_element| {
            let entry_point_address = wire_element.header_hash;
            match delete_action.delete_action::<EntryPoint, WasmError, SignalType>(
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
        outcome_header_hash: address,
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
    let payload = ExternIO::encode(signal)?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;

    Ok(delete_response)
}

// TODO: finish get outcome history
#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone)]
pub struct GetHistoryResponse {
    entries: Vec<Outcome>,
    members: Vec<Vec<OutcomeMember>>,
    address: HeaderHashB64,
}

// pub fn history_of_outcome(address: HeaderHashB64) -> ExternResult<GetHistoryResponse> {
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
//   .map(|member_address: HeaderHashB64| {
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
//                   if outcome_member.outcome_header_hash == address {
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
