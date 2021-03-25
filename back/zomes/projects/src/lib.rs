// use std::time::Duration;

use dna_help::{create_receive_signal_cap_grant, fetch_links, signal_peers, WrappedAgentPubKey};
use hdk::prelude::*;

mod project;

use project::{
    edge::{Edge, EdgeSignal},
    entry_point::{EntryPoint, EntryPointSignal},
    goal::{ArchiveGoalFullySignal, Goal, GoalSignal, GoalWithEdgeSignal},
    goal_comment::{GoalComment, GoalCommentSignal},
    goal_member::{GoalMember, GoalMemberSignal},
    goal_vote::{GoalVote, GoalVoteSignal},
    member::{Member, MemberSignal, MEMBER_PATH},
    project_meta::{ProjectMeta, ProjectMetaSignal},
};

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    // let start_init_time: Duration = sys_time()?;
    // debug!("start of init time {:?}", start_init_time.clone());
    // authorize receive_signal
    // not the issue, takes about 2 ms
    create_receive_signal_cap_grant()?;

    Path::from(MEMBER_PATH).ensure()?;

    // while joining, list me in the list of members
    // so that all peers can become aware of the new presence
    let member_path_address = Path::from(MEMBER_PATH).hash()?;
    let member = Member {
        address: WrappedAgentPubKey(agent_info()?.agent_initial_pubkey),
    };
    create_entry(&member)?;
    let member_entry_hash = hash_entry(&member)?;
    create_link(member_path_address, member_entry_hash, ())?;

    // let end_init_time: Duration = sys_time()?;
    // debug!("end of init time {:?}", end_init_time.clone());
    // debug!(
    //     "difference in init time {:?}",
    //     end_init_time - start_init_time
    // );
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
    Edge(EdgeSignal),
    EntryPoint(EntryPointSignal),
    Goal(GoalSignal),
    // custom signal type for a goal_with_edge
    // this is because it's important to the UI to receive both
    // the new goal, and the edge, at the same moment
    GoalWithEdge(GoalWithEdgeSignal),
    // custom signal type for goal_fully_archived
    // this is because it's important to the UI to receive
    // both the archived goal, and everything connected to it that
    // was archived at the same time
    ArchiveGoalFully(ArchiveGoalFullySignal),
    GoalComment(GoalCommentSignal),
    GoalMember(GoalMemberSignal),
    GoalVote(GoalVoteSignal),
    Member(MemberSignal),
    ProjectMeta(ProjectMetaSignal),
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
    let entries = fetch_links::<Member, Member>(path_hash, get_options)?;
    let agent_info = agent_info()?;
    Ok(entries
        .into_iter()
        // eliminate yourself as a peer
        .filter(|x| x.address.0 != agent_info.agent_initial_pubkey)
        .map(|x| x.address.0)
        .collect::<Vec<AgentPubKey>>())
}

// receiver (and forward to UI)
#[hdk_extern]
pub fn recv_remote_signal(sb: SerializedBytes) -> ExternResult<()> {
    let signal: SignalType = SignalType::try_from(sb)?;
    Ok(emit_signal(&signal)?)
}

// send update to peers alerting them that you joined
#[hdk_extern]
pub fn init_signal(_: ()) -> ExternResult<()> {
    let member = Member {
        address: WrappedAgentPubKey(agent_info()?.agent_initial_pubkey),
    };
    signal_peers(&MemberSignal::new(member.clone()), get_peers_latest)
}
