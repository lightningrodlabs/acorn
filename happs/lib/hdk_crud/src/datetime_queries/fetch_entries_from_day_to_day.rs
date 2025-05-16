use super::fetchers::Fetchers;
use super::inputs::FetchEntriesTime;
use crate::wire_record::WireRecord;
use chrono::Duration;
use hdk::prelude::*;

#[cfg(feature = "mock")]
use ::mockall::automock;

#[derive(Clone)]
pub struct FetchByDayDay {}
#[cfg_attr(feature = "mock", automock)]
impl FetchByDayDay {
    pub fn fetch_entries_from_day_to_day<
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
        while dt <= end {
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
        Ok(entries
            .into_iter()
            .filter_map(Result::ok)
            .flatten()
            .collect())
    }
}
