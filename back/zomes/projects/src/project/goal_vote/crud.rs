use crate::{
  get_peers_content,
  project::{error::Error, validate::entry_from_element_create_or_update},
  SignalType,
};
use dna_help::{crud, WrappedAgentPubKey, WrappedHeaderHash};
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
  ) -> Self {
    Self {
      goal_address,
      urgency,
      importance,
      impact,
      effort,
      agent_address,
      unix_timestamp,
    }
  }
}

// can be updated
impl TryFrom<&Element> for GoalVote {
  type Error = Error;
  fn try_from(element: &Element) -> Result<Self, Self::Error> {
    entry_from_element_create_or_update::<GoalVote>(element)
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
