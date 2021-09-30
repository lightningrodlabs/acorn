use crate::{
    get_peers_content,
    SignalType,
};
use hdk_crud::{crud, signals::ActionSignal};
use hdk::prelude::*;
use holo_hash::{AgentPubKeyB64, HeaderHashB64};

#[hdk_entry(id = "goal_comment")]
#[derive(Clone, PartialEq)]
pub struct GoalComment {
    pub goal_address: HeaderHashB64,
    pub content: String,
    pub agent_address: AgentPubKeyB64,
    pub unix_timestamp: f64,
    pub is_imported: bool,
}

impl GoalComment {
  pub fn new(
      goal_address: HeaderHashB64,
      content: String,
      agent_address: AgentPubKeyB64,
      unix_timestamp: f64,
      is_imported: bool,
  ) -> Self {
      Self {
          goal_address,
          content,
          agent_address,
          unix_timestamp,
          is_imported,
      }
  }
}

fn convert_to_receiver_signal(signal: ActionSignal<GoalComment>) -> SignalType {
    SignalType::GoalComment(signal)
}

crud!(
    GoalComment,
    goal_comment,
    "goal_comment",
    get_peers_content,
    convert_to_receiver_signal
);
