use crate::datetime_queries::inputs::FetchEntriesTime;
use crate::wire_record::WireRecord;
use hdk::prelude::*;

#[cfg(not(feature = "mock"))]
use crate::datetime_queries::fetch_by_day::FetchByDay;
#[cfg(not(feature = "mock"))]
use crate::datetime_queries::fetch_by_hour::FetchByHour;
#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;

#[cfg(feature = "mock")]
use crate::datetime_queries::fetch_by_day::MockFetchByDay as FetchByDay;
#[cfg(feature = "mock")]
use crate::datetime_queries::fetch_by_hour::MockFetchByHour as FetchByHour;
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;

/// fetches all entries linked to a time path index for either a specific day or hour of a day
pub fn fetch_entries_by_time<
    EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
    TY,
    E,
>(
    fetch_by_day: &FetchByDay,
    fetch_by_hour: &FetchByHour,
    get_latest_entry: &GetLatestEntry,
    link_type_filter: LinkTypeFilter,
    link_type: TY,
    time: FetchEntriesTime,
    base_component: String,
) -> Result<Vec<WireRecord<EntryType>>, WasmError>
where
    ScopedLinkType: TryFrom<TY, Error = E>,
    TY: Clone,
    WasmError: From<E>,
{
    Ok(match time.hour {
        None => fetch_by_day.fetch_entries_by_day(
            &fetch_by_hour,
            &get_latest_entry,
            link_type_filter,
            link_type,
            time,
            base_component,
        ),
        Some(h) => fetch_by_hour.fetch_entries_by_hour(
            &get_latest_entry,
            link_type_filter,
            link_type,
            time.year,
            time.month,
            time.day,
            h,
            base_component,
        ),
    }?)
}
