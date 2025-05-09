use super::fetchers::Fetchers;
use super::inputs::FetchEntriesTime;
use super::utils::next_day;
use crate::wire_record::WireRecord;
use chrono::{Datelike, Duration, Timelike};
use hdk::prelude::*;

#[cfg(feature = "mock")]
use ::mockall::automock;

pub struct FetchByHourHour {}
#[cfg_attr(feature = "mock", automock)]
impl FetchByHourHour {
    /// fetches all entries of a certain type between two dates (day and hour)
    pub fn fetch_entries_from_hour_to_hour<
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
        let second_day = next_day(dt.clone());
        let second_last_day = end.clone() - Duration::days(1);

        // if hour range is on same day, skip first two loops
        match next_day(dt.clone()) == next_day(end.clone()) {
            true => {}
            false => {
                while dt < second_day {
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
                while dt <= second_last_day {
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
            }
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
