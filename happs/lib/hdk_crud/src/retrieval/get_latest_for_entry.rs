use hdk::prelude::*;

use crate::{datetime_queries::utils::serialize_err, retrieval::utils::*, wire_record::WireRecord};

#[cfg(feature = "mock")]
use ::mockall::automock;

#[derive(Debug, PartialEq, Clone)]
pub struct GetLatestEntry {}
#[cfg_attr(feature = "mock", automock)]
impl GetLatestEntry {
    /// If an entry at the `entry_hash` has multiple updates to itself, this
    /// function will sort through them by timestamp in order to return the contents
    /// of the latest update. It also has the special behaviour of returning the
    /// ORIGINAL ActionHash, as opposed to the ActionHash of the Action that performed
    /// that latest update. This is useful if you want hashes in your application
    /// to act consistently, almost acting as an "id" in a centralized system.
    /// It simplifies traversal of the update tree, since all updates
    /// made by the client can reference the original, instead of updates reference updates
    pub fn get_latest_for_entry<
        T: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
    >(
        &self,
        entry_hash: EntryHash,
        get_options: GetOptions,
    ) -> ExternResult<Option<WireRecord<T>>> {
        match get_details(entry_hash.clone(), get_options.clone())? {
            Some(Details::Entry(details)) => match details.entry_dht_status {
                EntryDhtStatus::Live => {
                    let first_action = details.actions.first().unwrap();
                    let created_at = first_action.action().timestamp();
                    match details.updates.len() {
                        // pass out the action associated with this entry
                        0 => {
                            let updated_at = created_at.clone();
                            let maybe_entry_and_hashes = original_action_hash_with_entry(
                                get_action_hash(first_action.to_owned()),
                                get_options,
                            )?;
                            match maybe_entry_and_hashes {
                                Some(entry_and_hashes) => Ok(Some(WireRecord {
                                    action_hash: entry_and_hashes.1.into(),
                                    entry_hash: entry_and_hashes.2.into(),
                                    entry: entry_and_hashes.0,
                                    created_at,
                                    updated_at,
                                })),
                                None => Ok(None),
                            }
                        }
                        _ => {
                            let mut sortlist = details.updates.to_vec();
                            // unix timestamp should work for sorting
                            sortlist.sort_by_key(|update| update.action().timestamp().as_millis());
                            // sorts in ascending order, so take the last record
                            let last = sortlist.last().unwrap().to_owned();
                            let updated_at = last.action().timestamp();
                            let maybe_entry_and_hashes = original_action_hash_with_entry(
                                get_action_hash(last),
                                get_options,
                            )?;
                            match maybe_entry_and_hashes {
                                Some(entry_and_hashes) => Ok(Some(WireRecord {
                                    action_hash: entry_and_hashes.1.into(),
                                    entry_hash: entry_and_hashes.2.into(),
                                    entry: entry_and_hashes.0,
                                    created_at,
                                    updated_at,
                                })),
                                None => Ok(None),
                            }
                        }
                    }
                }
                EntryDhtStatus::Dead => Ok(None),
                _ => Ok(None),
            },
            _ => Ok(None),
        }
    }
}

fn original_action_hash_with_entry<
    T: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
>(
    action_hash: ActionHash,
    get_options: GetOptions,
) -> ExternResult<Option<(T, ActionHash, EntryHash)>> {
    match get(action_hash, get_options)? {
        Some(record) => match record.entry().to_app_option::<T>().map_err(serialize_err)? {
            Some(entry) => Ok(Some((
                entry,
                match record.action() {
                    // we DO want to return the action for the original
                    // instead of the updated, in our case
                    Action::Update(update) => update.original_action_address.clone(),
                    Action::Create(_) => record.action_address().clone(),
                    _ => {
                        unreachable!("Can't have returned a action for a nonexistent entry")
                    }
                },
                record.action().entry_hash().unwrap().to_owned(),
            ))),
            None => Ok(None),
        },
        None => Ok(None),
    }
}
