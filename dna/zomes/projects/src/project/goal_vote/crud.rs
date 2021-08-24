use crate::{
  get_peers_content,
  SignalType,
};
use hdk_crud::{crud, WrappedAgentPubKey, WrappedHeaderHash};
use hdk::prelude::*;

#[hdk_entry(id = "goal_vote")]
#[derive(Clone, PartialEq)]
pub struct GoalVote {
  pub goal_address: WrappedHeaderHash,
  pub urgency: f64,
  pub importance: f64,
  pub impact: f64,
  pub effort: f64,
  pub agent_address: WrappedAgentPubKey,
  pub unix_timestamp: f64,
  pub is_imported: bool,
}

impl GoalVote {
  pub fn new(
    goal_address: WrappedHeaderHash,
    urgency: f64,
    importance: f64,
    impact: f64,
    effort: f64,
    agent_address: WrappedAgentPubKey,
    unix_timestamp: f64,
    is_imported: bool,
  ) -> Self {
    Self {
      goal_address,
      urgency,
      importance,
      impact,
      effort,
      agent_address,
      unix_timestamp,
      is_imported,
    }
  }
}

fn convert_to_receiver_signal(signal: GoalVoteSignal) -> SignalType {
  SignalType::GoalVote(signal)
}

crud!(
  GoalVote,
  goal_vote,
  "goal_vote",
  get_peers_content,
  convert_to_receiver_signal
);
