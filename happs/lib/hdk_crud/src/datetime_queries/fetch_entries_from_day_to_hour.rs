use super::fetchers::Fetchers;
use crate::datetime_queries::inputs::FetchEntriesTime;
use crate::wire_record::WireRecord;
use chrono::{Datelike, Duration, Timelike};
use hdk::prelude::*;

#[cfg(feature = "mock")]
use ::mockall::automock;

pub struct FetchByDayHour {}
#[cfg_attr(feature = "mock", automock)]
impl FetchByDayHour {
    /// fetches all entries of a certain type between two days where the hour is not given for the start day
    pub fn fetch_entries_from_day_to_hour<
        EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
        TY,
        E,
    >(
        &self,
        fetchers: &Fetchers,
        link_type_filter: LinkTypeFilter,
        link_type: TY,
        start: FetchEntriesTime,
        end: FetchEntriesTime,
        base_component: String,
    ) -> Result<Vec<WireRecord<EntryType>>, WasmError>
    where
        ScopedLinkType: TryFrom<TY, Error = E>,
        TY: Clone,
        WasmError: From<E>,
    {
        let mut dt = start.to_date_time();
        let mut entries = Vec::new();
        let end = end.to_date_time();
        let end_prev = end - Duration::days(1); // this is to prevent fetch entries by day being called on the last day (we don't want all the hours on the last day)
        while dt < end_prev {
            entries.push(fetchers.day.fetch_entries_by_day::<EntryType, TY, E>(
                &fetchers.hour,
                &fetchers.get_latest,
                link_type_filter.clone(),
                link_type.clone(),
                FetchEntriesTime::from_date_time(dt.clone()),
                base_component.clone(),
            ));
            dt = dt + Duration::days(1);
        }
        while dt <= end {
            entries.push(fetchers.hour.fetch_entries_by_hour::<EntryType, TY, E>(
                &fetchers.get_latest,
                link_type_filter.clone(),
                link_type.clone(),
                dt.year(),
                dt.month(),
                dt.day(),
                dt.hour(),
                base_component.clone(),
            ));
            dt = dt + Duration::hours(1);
        }
        Ok(entries
            .into_iter()
            .filter_map(Result::ok)
            .flatten()
            .collect())
    }
}
