use hdk::prelude::*;

use super::fetchers::Fetchers;
use super::inputs::FetchEntriesTime;
use super::utils::is_valid_date_range;
use crate::wire_record::WireRecord;

/// fetches all entries of a certain type between two dates. Calls different sub methods depending on if an hour is suppled.
pub fn fetch_entries_in_time_range<
    EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
    TY,
    E,
>(
    fetchers: &Fetchers,
    link_type_filter: LinkTypeFilter,
    link_type: TY,
    start_time: FetchEntriesTime,
    end_time: FetchEntriesTime,
    base_component: String,
) -> Result<Vec<WireRecord<EntryType>>, WasmError>
where
    ScopedLinkType: TryFrom<TY, Error = E>,
    TY: Clone,
    WasmError: From<E>,
{
    is_valid_date_range(start_time.clone(), end_time.clone())?;
    match start_time.hour {
        None => {
            match end_time.hour {
                None => fetchers
                    .day_to_day
                    .fetch_entries_from_day_to_day::<EntryType, TY, E>(
                        fetchers,
                        link_type_filter,
                        link_type,
                        start_time.clone(),
                        end_time.clone(),
                        base_component,
                    ),
                Some(_) => {
                    //day to hour: loop from 1st day to 2nd last day, then loop through hours in last day
                    fetchers
                        .day_to_hour
                        .fetch_entries_from_day_to_hour::<EntryType, TY, E>(
                            fetchers,
                            link_type_filter,
                            link_type,
                            start_time.clone(),
                            end_time.clone(),
                            base_component,
                        )
                }
            }
        }
        Some(_) => {
            match end_time.hour {
                None => {
                    // hour to day: loop through hours on first day, then 2nd day to last day
                    fetchers
                        .hour_to_day
                        .fetch_entries_from_hour_to_day::<EntryType, TY, E>(
                            fetchers,
                            link_type_filter,
                            link_type,
                            start_time.clone(),
                            end_time.clone(),
                            base_component,
                        )
                }
                Some(_) => {
                    // hour to hour: loop through hours on first day, then 2nd day to 2nd last day, then hours on last day
                    fetchers
                        .hour_to_hour
                        .fetch_entries_from_hour_to_hour::<EntryType, TY, E>(
                            fetchers,
                            link_type_filter,
                            link_type,
                            start_time.clone(),
                            end_time.clone(),
                            base_component,
                        )
                }
            }
        }
    }
}
