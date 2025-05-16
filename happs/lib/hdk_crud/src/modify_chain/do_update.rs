use crate::wire_record::WireRecord;
use crate::{datetime_queries::utils::serialize_err, modify_chain::utils::add_current_time_path};
use hdk::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKey, EntryHashB64};

#[cfg(feature = "mock")]
use ::mockall::automock;

/// a struct which implements a [do_update](DoUpdate::do_update) method
/// a method is used instead of a function so that it can be mocked to simplify unit testing
#[derive(Debug, PartialEq, Clone)]
pub struct DoUpdate {}
#[cfg_attr(feature = "mock", automock)]
impl DoUpdate {
    /// This will add an update to an entry.
    /// It can also optionally send a signal of this event to all peers supplied in `send_signal_to_peers`
    /// uses `ChainTopOrdering::Relaxed` such that multiple updates can be committed in parallel
    pub fn do_update<T, E, S, R>(
        &self,
        entry: T,
        action_hash: ActionHashB64,
        entry_type_id: String,
        scoped_link_type: R,
        send_signal_to_peers: Option<Vec<AgentPubKey>>,
        add_time_path: Option<String>,
    ) -> ExternResult<WireRecord<T>>
    where
        Entry: TryFrom<T, Error = E>,
        ScopedLinkType: TryFrom<R, Error = E>,
        R: Clone,
        WasmError: From<E>,
        T: 'static + Clone,
        AppEntryBytes: TryFrom<T, Error = E>,
        S: 'static + From<crate::signals::ActionSignal<T>> + serde::Serialize + std::fmt::Debug,
        E: 'static,
    {
        // calling update instead of update_entry to be able to indicate relaxed chain ordering
        hdk::entry::update(UpdateInput {
            original_action_address: action_hash.clone().into(),
            entry: Entry::App(entry.clone().try_into()?),
            chain_top_ordering: ChainTopOrdering::Relaxed,
        })?;
        let entry_address = hash_entry(entry.clone())?;
        match add_time_path {
            None => (),
            Some(base_component) => {
                // create a time_path
                add_current_time_path(
                    base_component,
                    entry_address.clone(),
                    scoped_link_type,
                    LinkTag::from(vec![]),
                )?;
            }
        }
        let updated_at = sys_time()?;
        // get create time from the action_hash
        let maybe_record = get(ActionHash::from(action_hash.clone()), GetOptions::default())?;
        let created_at = match maybe_record {
            Some(record) => Ok(record.signed_action().action().timestamp()),
            None => Err(wasm_error!(WasmErrorInner::Guest(String::from(
                "unable to get record from provided action hash",
            )))),
        }?;
        let wire_entry: WireRecord<T> = WireRecord {
            entry,
            action_hash,
            entry_hash: EntryHashB64::new(entry_address),
            created_at,
            updated_at,
        };
        match send_signal_to_peers {
            None => (),
            Some(vec_peers) => {
                let action_signal: crate::signals::ActionSignal<T> = crate::signals::ActionSignal {
                    entry_type: entry_type_id,
                    action: crate::signals::ActionType::Update,
                    data: crate::signals::SignalData::Update(wire_entry.clone()),
                };
                let signal = S::from(action_signal);
                let payload = ExternIO::encode(signal).map_err(serialize_err)?;
                send_remote_signal(payload, vec_peers)?;
            }
        }
        Ok(wire_entry)
    }
}
