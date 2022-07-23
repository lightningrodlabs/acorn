use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;

use projects_integrity::{project::tag::entry::Tag, EntryTypes, LinkTypes};

crud!(
    Tag,
    EntryTypes,
    EntryTypes::Tag,
    LinkTypes,
    LinkTypes::All,
    tag,
    "tag",
    get_peers_content,
    SignalType
);
