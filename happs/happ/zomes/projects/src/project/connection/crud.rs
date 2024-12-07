use crate::{get_peers_content, SignalType};
use hdk::prelude::*;
use hdk_crud::crud;
use projects_integrity::{project::connection::entry::Connection, EntryTypes, LinkTypes};

crud!(
    Connection,
    EntryTypes,
    EntryTypes::Connection,
    LinkTypes,
    LinkTypes::All,
    connection,
    "connection",
    get_peers_content,
    SignalType
);
