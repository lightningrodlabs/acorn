use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use projects_integrity::{project::outcome_comment::entry::OutcomeComment, EntryTypes, LinkTypes};

crud!(
    OutcomeComment,
    EntryTypes,
    EntryTypes::OutcomeComment,
    LinkTypes,
    LinkTypes::All,
    outcome_comment,
    "outcome_comment",
    get_peers_content,
    SignalType
);
