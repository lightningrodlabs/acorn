use hdk::prelude::*;

pub mod project;

use hdk_crud::{
    retrieval::fetch_links,
    signals::{create_receive_signal_cap_grant, ActionSignal},
};
use holo_hash::AgentPubKeyB64;
use project::{
    edge::crud::Edge,
    entry_point::crud::EntryPoint,
    goal::crud::{ArchiveGoalFullySignal, Goal, GoalWithEdgeSignal},
    goal_comment::crud::GoalComment,
    goal_member::crud::GoalMember,
    goal_vote::crud::GoalVote,
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
    Path::entry_def(),
    Edge::entry_def(),
    EntryPoint::entry_def(),
    Goal::entry_def(),
    GoalComment::entry_def(),
    GoalMember::entry_def(),
    GoalVote::entry_def(),
    Member::entry_def(),
    ProjectMeta::entry_def()
);

/*
SIGNALS
*/

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
// untagged because the useful tagging is done internally on the *Signal objects
#[serde(untagged)]
pub enum SignalType {
    Edge(ActionSignal<Edge>),
    EntryPoint(ActionSignal<EntryPoint>),
    Goal(ActionSignal<Goal>),
    // custom signal type for a goal_with_edge
    // this is because it's important to the UI to receive both
    // the new goal, and the edge, at the same moment
    GoalWithEdge(GoalWithEdgeSignal),
    // custom signal type for goal_fully_archived
    // this is because it's important to the UI to receive
    // both the archived goal, and everything connected to it that
    // was archived at the same time
    ArchiveGoalFully(ArchiveGoalFullySignal),
    GoalComment(ActionSignal<GoalComment>),
    GoalMember(ActionSignal<GoalMember>),
    GoalVote(ActionSignal<GoalVote>),
    Member(MemberSignal),
    ProjectMeta(ActionSignal<ProjectMeta>),
}

pub fn get_peers_latest() -> ExternResult<Vec<AgentPubKey>> {
    get_peers(GetOptions::latest())
}
pub fn get_peers_content() -> ExternResult<Vec<AgentPubKey>> {
    get_peers(GetOptions::content())
}

// used to get addresses of agents to send signals to
pub fn get_peers(get_options: GetOptions) -> ExternResult<Vec<AgentPubKey>> {
    let path_hash = Path::from(MEMBER_PATH).hash()?;
    let entries = fetch_links::<Member>(path_hash, get_options)?;
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
