use crate::{
    get_peers_content,
    project::{error::Error, validate::entry_from_element_create_only},
    SignalType,
};
use dna_help::{crud, WrappedAgentPubKey, WrappedHeaderHash};
use hdk::prelude::*;

// a relationship between a Goal and an Agent
// representing roughly the idea of someone being "assigned to"
// or "responsible for" or "working on"
#[hdk_entry(id = "goal_member")]
#[derive(Clone, PartialEq)]
pub struct GoalMember {
    pub goal_address: WrappedHeaderHash,
    // the "assignee"
    pub agent_address: WrappedAgentPubKey,
    // the person who authored this entry
    pub user_edit_hash: WrappedAgentPubKey,
    pub unix_timestamp: f64,
}

impl GoalMember {
    pub fn new(
        goal_address: WrappedHeaderHash,
        agent_address: WrappedAgentPubKey,
        user_edit_hash: WrappedAgentPubKey,
        unix_timestamp: f64,
    ) -> Self {
        Self {
            goal_address,
            agent_address,
            user_edit_hash,
            unix_timestamp,
        }
    }
}

// can't be updated
impl TryFrom<&Element> for GoalMember {
    type Error = Error;
    fn try_from(element: &Element) -> Result<Self, Self::Error> {
        entry_from_element_create_only::<GoalMember>(element)
    }
}

fn convert_to_receiver_signal(signal: GoalMemberSignal) -> SignalType {
    SignalType::GoalMember(signal)
}

crud!(
    GoalMember,
    goal_member,
    "goal_member",
    get_peers_content,
    convert_to_receiver_signal
);

// DELETE
// clear all members
pub fn archive_goal_members(address: WrappedHeaderHash) -> ExternResult<Vec<WrappedHeaderHash>> {
    Ok(inner_fetch_goal_members(GetOptions::content())?
        .0
        .into_iter()
        .filter(|wire_entry: &GoalMemberWireEntry| {
            // check whether the parent_address or child_address is equal to the given address.
            // If so, the edge is connected to the goal being archived.
            wire_entry.entry.goal_address == address.clone()
        })
        .map(|wire_entry: GoalMemberWireEntry| {
            let goal_member_address = wire_entry.address;
            // archive the edge with this address
            // this will also trigger signals
            match inner_archive_goal_member(goal_member_address.clone(), true) {
                Ok(_) => Ok(goal_member_address),
                Err(e) => Err(e),
            }
        })
        // filter out errors
        .filter_map(Result::ok)
        .collect())
}
