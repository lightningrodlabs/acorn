use crate::wire_record::WireRecord;
use crate::{datetime_queries::utils::serialize_err, modify_chain::utils::add_current_time_path};
use hdk::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKey, EntryHashB64};

#[cfg(feature = "mock")]
use ::mockall::automock;

use super::utils::create_link_relaxed;

/// an enum passed into do_create to indicate whether the newly created entry is to be
/// linked off a path (like an anchor for entry types) or a supplied entry hash
#[derive(Debug, PartialEq, Clone)]
pub enum TypedPathOrEntryHash {
    TypedPath(TypedPath),
    EntryHash(EntryHash),
}

/// a struct which implements a [do_create](DoCreate::do_create) method
/// a method is used instead of a function so that it can be mocked to simplify unit testing
#[derive(Debug, PartialEq, Clone)]
pub struct DoCreate {}
#[cfg_attr(feature = "mock", automock)]
impl DoCreate {
    /// This will create an entry and will either link it off the main Path or a supplied entry hash.
    /// It can also optionally send a signal of this event to all peers supplied in `send_signal_to_peers`
    /// uses `ChainTopOrdering::Relaxed` such that multiple creates can be committed in parallel
    pub fn do_create<MyEntryTypes, CrudType, E, S, R>(
        &self,
        full_entry: MyEntryTypes,
        inner_entry: CrudType,
        link_off: Option<TypedPathOrEntryHash>,
        entry_type_id: String,
        scoped_link_type: R,
        send_signal_to_peers: Option<Vec<AgentPubKey>>,
        add_time_path: Option<String>,
    ) -> ExternResult<WireRecord<CrudType>>
    where
        CrudType: Clone,
        ScopedEntryDefIndex: for<'a> TryFrom<&'a MyEntryTypes, Error = E>,
        EntryVisibility: for<'a> From<&'a MyEntryTypes>,
        Entry: 'static + TryFrom<MyEntryTypes, Error = E>,
        ScopedLinkType: TryFrom<R, Error = E>,
        R: Clone,
        WasmError: From<E>,
        MyEntryTypes: 'static + Clone,
        AppEntryBytes: TryFrom<MyEntryTypes, Error = E>,
        S: 'static
            + From<crate::signals::ActionSignal<CrudType>>
            + serde::Serialize
            + std::fmt::Debug,
        E: 'static,
    {
        // calling create instead of create_entry to be able to indicate relaxed chain ordering
        let ScopedEntryDefIndex {
            zome_index,
            zome_type: entry_def_index,
        } = (&full_entry).try_into()?;
        let visibility = EntryVisibility::from(&full_entry);
        let address = create(CreateInput::new(
            EntryDefLocation::app(zome_index, entry_def_index),
            visibility,
            full_entry.clone().try_into()?,
            ChainTopOrdering::Relaxed,
        ))?;
        let entry_hash = hash_entry(full_entry.clone())?;
        match link_off {
            None => (), //no link is made
            Some(path_or_entry_hash) => match path_or_entry_hash {
                TypedPathOrEntryHash::TypedPath(path) => {
                    // link off entry path
                    path.ensure()?;
                    let path_hash = path.path_entry_hash()?;
                    create_link_relaxed(
                        path_hash,
                        entry_hash.clone(),
                        scoped_link_type.clone(),
                        LinkTag::from(vec![]),
                    )?;
                }
                TypedPathOrEntryHash::EntryHash(base_entry_hash) => {
                    // link off supplied entry hash
                    create_link_relaxed(
                        base_entry_hash,
                        entry_hash.clone(),
                        scoped_link_type.clone(),
                        LinkTag::from(vec![]),
                    )?;
                }
            },
        }
        match add_time_path {
            None => (),
            Some(base_component) => {
                // create a time_path
                add_current_time_path(
                    base_component,
                    entry_hash.clone(),
                    scoped_link_type,
                    LinkTag::from(vec![]),
                )?;
            }
        }
        let time = sys_time()?; // this won't exactly match the timestamp stored in the record details
        let wire_entry: WireRecord<CrudType> = WireRecord {
            entry: inner_entry,
            action_hash: ActionHashB64::new(address),
            entry_hash: EntryHashB64::new(entry_hash),
            created_at: time,
            updated_at: time,
        };

        match send_signal_to_peers {
            None => (),
            Some(vec_peers) => {
                let action_signal: crate::signals::ActionSignal<CrudType> =
                    crate::signals::ActionSignal {
                        entry_type: entry_type_id,
                        action: crate::signals::ActionType::Create,
                        data: crate::signals::SignalData::Create(wire_entry.clone()),
                    };
                let signal = S::from(action_signal);
                let payload = ExternIO::encode(signal).map_err(serialize_err)?;
                send_remote_signal(payload, vec_peers)?;
            }
        }
        Ok(wire_entry)
    }
}
