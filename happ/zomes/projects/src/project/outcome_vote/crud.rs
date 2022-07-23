use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use projects_integrity::{project::outcome_vote::entry::OutcomeVote, EntryTypes, LinkTypes};

crud!(
    OutcomeVote,
    EntryTypes,
    EntryTypes::OutcomeVote,
    LinkTypes,
    LinkTypes::All,
    outcome_vote,
    "outcome_vote",
    get_peers_content,
    SignalType
);
