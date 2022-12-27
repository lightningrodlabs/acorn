use hdk::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKeyB64};

pub mod project;
pub mod ui_enum;

use hdk_crud::{
    retrieval::{fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry},
    signals::{create_receive_signal_cap_grant, ActionSignal},
};
use project::{
    member::entry::{join_project_during_init, MemberSignal, MEMBER_PATH},
    outcome::crud::{DeleteOutcomeFullySignal, OutcomeWithConnectionSignal},
};
use projects_integrity::{
    project::{
        connection::entry::Connection, entry_point::entry::EntryPoint, member::entry::Member,
        outcome::entry::Outcome, outcome_comment::entry::OutcomeComment,
        outcome_member::entry::OutcomeMember, outcome_vote::entry::OutcomeVote,
        project_meta::entry::ProjectMeta, tag::entry::Tag,
    },
    LinkTypes,
};

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    // authorize receive_signal
    // not the issue, takes about 2 ms
    create_receive_signal_cap_grant()?;

    // add our member entry to the project
    join_project_during_init()?;

    Ok(InitCallbackResult::Pass)
}

/*
SIGNALS
*/

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
// untagged because the useful tagging is done internally on the *Signal objects
#[serde(tag = "signalType", content = "data")]
pub enum SignalType {
    Tag(ActionSignal<Tag>),
    Connection(ActionSignal<Connection>),
    EntryPoint(ActionSignal<EntryPoint>),
    Outcome(ActionSignal<Outcome>),
    // custom signal type for an Outcome_with_connection
    // this is because it's important to the UI to receive both
    // the new outcome, and the connection, at the same moment
    OutcomeWithConnection(OutcomeWithConnectionSignal),
    // custom signal type for outcome_fully_deleted
    // this is because it's important to the UI to receive
    // both the deleted outcome, and everything connected to it that
    // was deleted at the same time
    DeleteOutcomeFully(DeleteOutcomeFullySignal),
    EditingOutcome(EditingOutcomeSignal),
    OutcomeComment(ActionSignal<OutcomeComment>),
    OutcomeMember(ActionSignal<OutcomeMember>),
    OutcomeVote(ActionSignal<OutcomeVote>),
    Member(MemberSignal),
    ProjectMeta(ActionSignal<ProjectMeta>),
    RealtimeInfo(RealtimeInfoSignal),
}

impl From<ActionSignal<Tag>> for SignalType {
    fn from(value: ActionSignal<Tag>) -> Self {
        SignalType::Tag(value)
    }
}
impl From<ActionSignal<Connection>> for SignalType {
    fn from(value: ActionSignal<Connection>) -> Self {
        SignalType::Connection(value)
    }
}
impl From<ActionSignal<EntryPoint>> for SignalType {
    fn from(value: ActionSignal<EntryPoint>) -> Self {
        SignalType::EntryPoint(value)
    }
}
impl From<ActionSignal<Outcome>> for SignalType {
    fn from(value: ActionSignal<Outcome>) -> Self {
        SignalType::Outcome(value)
    }
}
impl From<ActionSignal<OutcomeComment>> for SignalType {
    fn from(value: ActionSignal<OutcomeComment>) -> Self {
        SignalType::OutcomeComment(value)
    }
}
impl From<ActionSignal<OutcomeMember>> for SignalType {
    fn from(value: ActionSignal<OutcomeMember>) -> Self {
        SignalType::OutcomeMember(value)
    }
}
impl From<ActionSignal<OutcomeVote>> for SignalType {
    fn from(value: ActionSignal<OutcomeVote>) -> Self {
        SignalType::OutcomeVote(value)
    }
}
impl From<ActionSignal<ProjectMeta>> for SignalType {
    fn from(value: ActionSignal<ProjectMeta>) -> Self {
        SignalType::ProjectMeta(value)
    }
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub enum OutcomeField {
    Title,
    Description,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct EditingOutcomeSignal {
    pub outcome_field: OutcomeField,
    pub outcome_action_hash: ActionHashB64,
    pub editing_agent_pub_key: AgentPubKeyB64,
    pub is_editing: bool,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct EditingOutcomeInput {
    pub outcome_field: OutcomeField,
    pub outcome_action_hash: ActionHashB64,
    pub is_editing: bool,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeInfoSignal {
    pub agent_pub_key: AgentPubKeyB64,
    pub project_id: String,
    pub outcome_being_edited: Option<EditingOutcomeDetails>,
    pub outcome_expanded_view: Option<ActionHashB64>,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeInfoInput {
    pub project_id: String,
    pub outcome_being_edited: Option<EditingOutcomeDetails>,
    pub outcome_expanded_view: Option<ActionHashB64>,
}
#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct EditingOutcomeDetails {
    pub outcome_action_hash: ActionHashB64,
    pub is_title: bool,
}
#[hdk_extern]
pub fn emit_realtime_info_signal(realtime_info: RealtimeInfoInput) -> ExternResult<()> {
    let realtime_info_signal = RealtimeInfoSignal {
        agent_pub_key: AgentPubKeyB64::new(agent_info()?.agent_latest_pubkey),
        project_id: realtime_info.project_id,
        outcome_being_edited: realtime_info.outcome_being_edited,
        outcome_expanded_view: realtime_info.outcome_expanded_view,
    };

    let signal = SignalType::RealtimeInfo(realtime_info_signal);
    let payload = ExternIO::encode(signal).map_err(|e| wasm_error!(e))?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;
    Ok(())
}
#[hdk_extern]
pub fn emit_editing_outcome_signal(editing_outcome_info: EditingOutcomeInput) -> ExternResult<()> {
    let editing_outcome_signal = EditingOutcomeSignal {
        outcome_field: editing_outcome_info.outcome_field,
        outcome_action_hash: editing_outcome_info.outcome_action_hash,
        editing_agent_pub_key: AgentPubKeyB64::new(agent_info()?.agent_latest_pubkey),
        is_editing: editing_outcome_info.is_editing,
    };

    let signal = SignalType::EditingOutcome(editing_outcome_signal);
    let payload = ExternIO::encode(signal).map_err(|e| wasm_error!(e))?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;
    Ok(())
}

pub fn get_peers_latest() -> ExternResult<Vec<AgentPubKey>> {
    get_peers(GetOptions::latest())
}
pub fn get_peers_content() -> ExternResult<Vec<AgentPubKey>> {
    get_peers(GetOptions::content())
}

// used to get addresses of agents to send signals to
pub fn get_peers(get_options: GetOptions) -> ExternResult<Vec<AgentPubKey>> {
    let path_hash = Path::from(MEMBER_PATH).path_entry_hash()?;
    let get_latest = GetLatestEntry {};
    let fetch_links = FetchLinks {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::All)?;
    let entries = fetch_links.fetch_links::<Member>(
        &get_latest,
        path_hash,
        link_type_filter,
        None,
        get_options,
    )?;
    let self_agent_pub_key = AgentPubKeyB64::new(agent_info()?.agent_latest_pubkey);
    Ok(entries
        .into_iter()
        // eliminate yourself as a peer
        .filter(|x| x.entry.agent_pub_key != self_agent_pub_key)
        .map(|x| AgentPubKey::from(x.entry.agent_pub_key))
        .collect::<Vec<AgentPubKey>>())
}

// receiver
// (forwards signals to the UI)
#[hdk_extern]
pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let sig: SignalType = signal.decode().map_err(|e| wasm_error!(e))?;
    debug!("Received remote signal {:?}", sig);
    Ok(emit_signal(&signal)?)
}
