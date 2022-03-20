use hdk::prelude::*;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

pub mod project;

use hdk_crud::{
    retrieval::{get_latest_for_entry::GetLatestEntry, fetch_links::FetchLinks},
    signals::{create_receive_signal_cap_grant, ActionSignal},
};
use project::{
    connection::crud::Connection,
    entry_point::crud::EntryPoint,
    outcome::crud::{DeleteOutcomeFullySignal, Outcome, OutcomeWithConnectionSignal},
    outcome_comment::crud::OutcomeComment,
    outcome_member::crud::OutcomeMember,
    outcome_vote::crud::OutcomeVote,
    member::entry::{join_project_during_init, Member, MemberSignal, MEMBER_PATH},
    project_meta::crud::ProjectMeta,
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

entry_defs!(
    PathEntry::entry_def(),
    Connection::entry_def(),
    EntryPoint::entry_def(),
    Outcome::entry_def(),
    OutcomeComment::entry_def(),
    OutcomeMember::entry_def(),
    OutcomeVote::entry_def(),
    Member::entry_def(),
    ProjectMeta::entry_def()
);

/*
SIGNALS
*/

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
// untagged because the useful tagging is done internally on the *Signal objects
#[serde(tag = "signalType", content = "data")]
pub enum SignalType {
    Connection(ActionSignal<Connection>),
    EntryPoint(ActionSignal<EntryPoint>),
    Outcome(ActionSignal<Outcome>),
    // custom signal type for a outcome_with_connection
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
    pub outcome_address: HeaderHashB64,
    pub editing_agent: AgentPubKeyB64,
    pub is_editing: bool,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct EditingOutcomeInput {
    pub outcome_field: OutcomeField,
    pub outcome_address: HeaderHashB64,
    pub is_editing: bool,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeInfoSignal {
    pub agent_pub_key: AgentPubKeyB64,
    pub project_id: String,
    pub outcome_being_edited: Option<EditingOutcomeDetails>,
    pub outcome_expanded_view: Option<HeaderHashB64>,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeInfoInput {
    pub project_id: String,
    pub outcome_being_edited: Option<EditingOutcomeDetails>,
    pub outcome_expanded_view: Option<HeaderHashB64>,
}
#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct EditingOutcomeDetails {
    pub outcome_address: HeaderHashB64,
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
    let payload = ExternIO::encode(signal)?;
    let peers = get_peers_content()?;
    remote_signal(payload, peers)?;
    Ok(())
}
#[hdk_extern]
pub fn emit_editing_outcome_signal(editing_outcome_info: EditingOutcomeInput) -> ExternResult<()> {
    let editing_outcome_signal = EditingOutcomeSignal {
        outcome_field: editing_outcome_info.outcome_field,
        outcome_address: editing_outcome_info.outcome_address,
        editing_agent: AgentPubKeyB64::new(agent_info()?.agent_latest_pubkey),
        is_editing: editing_outcome_info.is_editing,
    };

    let signal = SignalType::EditingOutcome(editing_outcome_signal);
    let payload = ExternIO::encode(signal)?;
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
    let entries = fetch_links.fetch_links::<Member>(&get_latest, path_hash, get_options)?;
    let self_agent_pub_key = AgentPubKeyB64::new(agent_info()?.agent_latest_pubkey);
    Ok(entries
        .into_iter()
        // eliminate yourself as a peer
        .filter(|x| x.entry.address != self_agent_pub_key)
        .map(|x| AgentPubKey::from(x.entry.address))
        .collect::<Vec<AgentPubKey>>())
}

// receiver
// (forwards signals to the UI)
#[hdk_extern]
pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let sig: SignalType = signal.decode()?;
    debug!("Received remote signal {:?}", sig);
    Ok(emit_signal(&signal)?)
}
