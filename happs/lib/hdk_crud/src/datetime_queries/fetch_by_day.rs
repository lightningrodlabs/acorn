use crate::datetime_queries::inputs::FetchEntriesTime;
use crate::datetime_queries::utils::{day_path_from_date, err, get_last_component_string};
use crate::wire_record::WireRecord;
use hdk::prelude::*;

#[cfg(feature = "mock")]
use ::mockall::automock;

#[cfg(not(feature = "mock"))]
use crate::datetime_queries::fetch_by_hour::FetchByHour;
#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;

#[cfg(feature = "mock")]
use crate::datetime_queries::fetch_by_hour::MockFetchByHour as FetchByHour;
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;
#[derive(Clone)]
pub struct FetchByDay {}
#[cfg_attr(feature = "mock", automock)]
impl FetchByDay {
    /// fetches all entries linked to a time path index for a certain day
    pub fn fetch_entries_by_day<
        EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
        TY,
        E,
    >(
        &self,
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
        let path = day_path_from_date(
            link_type.clone(),
            base_component.clone(),
            time.year,
            time.month,
            time.day,
        )?;
        // TODO: wrap in path.exists which would add extra hdk calls to be mocked in the test
        let children = path.children()?;
        let entries = children
            .into_iter()
            .map(|hour_link| {
                let hour_str = get_last_component_string(hour_link.tag)?;
                let hour = hour_str.parse::<u32>().or(Err(err("Invalid path")))?;
                fetch_by_hour.fetch_entries_by_hour::<EntryType, TY, E>(
                    &get_latest_entry,
                    link_type_filter.clone(),
                    link_type.clone(),
                    time.year,
                    time.month,
                    time.day,
                    hour,
                    base_component.clone(),
                )
            })
            .filter_map(Result::ok)
            .flatten()
            .collect();
        Ok(entries)
    }
}
