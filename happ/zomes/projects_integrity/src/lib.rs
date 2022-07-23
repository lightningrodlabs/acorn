use hdi::prelude::*;

pub mod project;
pub mod ui_enum;

use project::{
    connection::entry::Connection, entry_point::entry::EntryPoint, member::entry::Member,
    outcome::entry::Outcome, outcome_comment::entry::OutcomeComment,
    outcome_member::entry::OutcomeMember, outcome_vote::entry::OutcomeVote,
    project_meta::entry::ProjectMeta, tag::entry::Tag,
};

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
#[derive(Clone)]
pub enum EntryTypes {
    #[entry_def]
    Tag(Tag),
    #[entry_def]
    Connection(Connection),
    #[entry_def]
    EntryPoint(EntryPoint),
    #[entry_def]
    Outcome(Outcome),
    #[entry_def]
    OutcomeComment(OutcomeComment),
    #[entry_def]
    OutcomeMember(OutcomeMember),
    #[entry_def]
    OutcomeVote(OutcomeVote),
    #[entry_def]
    Member(Member),
    #[entry_def]
    ProjectMeta(ProjectMeta),
}

#[hdk_link_types]
pub enum LinkTypes {
    All,
}
