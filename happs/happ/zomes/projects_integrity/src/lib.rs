use hdi::prelude::*;

pub mod project;
pub mod ui_enum;

use project::{
    connection::entry::Connection, entry_point::entry::EntryPoint, member::entry::Member,
    outcome::entry::Outcome, outcome_comment::entry::OutcomeComment,
    outcome_member::entry::OutcomeMember, outcome_vote::entry::OutcomeVote,
    project_meta::entry::ProjectMeta, tag::entry::Tag,
};

#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
#[derive(Clone)]
pub enum EntryTypes {
    #[entry_type]
    Tag(Tag),
    #[entry_type]
    Connection(Connection),
    #[entry_type]
    EntryPoint(EntryPoint),
    #[entry_type]
    Outcome(Outcome),
    #[entry_type]
    OutcomeComment(OutcomeComment),
    #[entry_type]
    OutcomeMember(OutcomeMember),
    #[entry_type]
    OutcomeVote(OutcomeVote),
    #[entry_type]
    Member(Member),
    #[entry_type]
    ProjectMeta(ProjectMeta),
}

#[hdk_link_types]
pub enum LinkTypes {
    All,
}
