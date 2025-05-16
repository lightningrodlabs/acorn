use hdk::prelude::*;
use holo_hash::{ActionHashB64, AgentPubKey};

#[cfg(feature = "mock")]
use ::mockall::automock;

use crate::datetime_queries::utils::serialize_err;

/// a struct which implements a [do_delete](DoDelete::do_delete) method
/// a method is used instead of a function so that it can be mocked to simplify unit testing
#[derive(Debug, PartialEq, Clone)]
pub struct DoDelete {}
#[cfg_attr(feature = "mock", automock)]
impl DoDelete {
    /// This will mark the entry at `address` as "deleted".
    /// It can also optionally send a signal of this event to all peers supplied in `send_signal_to_peers`
    /// to all peers returned by the `get_peers` call given during the macro call to `crud!`
    pub fn do_delete<T, E, S>(
        &self,
        action_hash: ActionHashB64,
        entry_type_id: String,
        send_signal_to_peers: Option<Vec<AgentPubKey>>,
    ) -> ExternResult<ActionHashB64>
    where
        Entry: 'static + TryFrom<T, Error = E>,
        WasmError: 'static + From<E>,
        T: 'static + Clone,
        AppEntryBytes: 'static + TryFrom<T, Error = E>,
        S: 'static + From<crate::signals::ActionSignal<T>> + serde::Serialize + std::fmt::Debug,
        E: 'static,
    {
        delete_entry(DeleteInput::new(
            action_hash.clone().into(),
            ChainTopOrdering::Relaxed,
        ))?;
        match send_signal_to_peers {
            None => (),
            Some(vec_peers) => {
                let action_signal: crate::signals::ActionSignal<T> = crate::signals::ActionSignal {
                    entry_type: entry_type_id,
                    action: crate::signals::ActionType::Delete,
                    data: crate::signals::SignalData::Delete::<T>(action_hash.clone()),
                };
                let signal = S::from(action_signal);
                let payload = ExternIO::encode(signal).map_err(serialize_err)?;
                send_remote_signal(payload, vec_peers)?;
            }
        }
        Ok(action_hash)
    }
}
