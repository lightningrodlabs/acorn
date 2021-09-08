use hdk_crud::{create_receive_signal_cap_grant, fetch_links};
use hdk::prelude::*;

pub mod project;

use project::{
  edge::crud::{Edge, EdgeSignal},
  entry_point::crud::{EntryPoint, EntryPointSignal},
  goal::crud::{ArchiveGoalFullySignal, Goal, GoalSignal, GoalWithEdgeSignal},
  goal_comment::crud::{GoalComment, GoalCommentSignal},
  goal_member::crud::{GoalMember, GoalMemberSignal},
  goal_vote::crud::{GoalVote, GoalVoteSignal},
  member::entry::{join_project_during_init, Member, MemberSignal, MEMBER_PATH},
  project_meta::crud::{ProjectMeta, ProjectMetaSignal},
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
  Ok(
    entries
      .into_iter()
      // eliminate yourself as a peer
      .filter(|x| x.address.0 != agent_info.agent_initial_pubkey)
      .map(|x| x.address.0)
      .collect::<Vec<AgentPubKey>>(),
  )
}

// receiver
// (forwards signals to the UI)
#[hdk_extern]
pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
  let sig: SignalType = signal.decode()?;
  debug!("Received remote signal {:?}", sig);
  Ok(emit_signal(&signal)?)
}
