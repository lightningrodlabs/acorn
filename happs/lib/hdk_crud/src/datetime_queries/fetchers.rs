#[cfg(not(feature = "mock"))]
use super::{
    fetch_by_day::FetchByDay, fetch_by_hour::FetchByHour,
    fetch_entries_from_day_to_day::FetchByDayDay, fetch_entries_from_day_to_hour::FetchByDayHour,
    fetch_entries_from_hour_to_day::FetchByHourDay,
    fetch_entries_from_hour_to_hour::FetchByHourHour,
};
#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;

#[cfg(feature = "mock")]
use super::{
    fetch_by_day::MockFetchByDay as FetchByDay, fetch_by_hour::MockFetchByHour as FetchByHour,
    fetch_entries_from_day_to_day::MockFetchByDayDay as FetchByDayDay,
    fetch_entries_from_day_to_hour::MockFetchByDayHour as FetchByDayHour,
    fetch_entries_from_hour_to_day::MockFetchByHourDay as FetchByHourDay,
    fetch_entries_from_hour_to_hour::MockFetchByHourHour as FetchByHourHour,
};

/// A struct containing all structs which implement fetching related methods.
/// This way only an instance of this struct needs to be passed in to any one fetching method/function.
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;
pub struct Fetchers {
    pub day_to_day: FetchByDayDay,
    pub day_to_hour: FetchByDayHour,
    pub hour_to_day: FetchByHourDay,
    pub hour_to_hour: FetchByHourHour,
    pub day: FetchByDay,
    pub hour: FetchByHour,
    pub get_latest: GetLatestEntry,
}
impl Fetchers {
    pub fn new(
        day_to_day: FetchByDayDay,
        day_to_hour: FetchByDayHour,
        hour_to_day: FetchByHourDay,
        hour_to_hour: FetchByHourHour,
        day: FetchByDay,
        hour: FetchByHour,
        get_latest: GetLatestEntry,
    ) -> Self {
        Self {
            day_to_day,
            day_to_hour,
            hour_to_day,
            hour_to_hour,
            day,
            hour,
            get_latest,
        }
    }
}
#[cfg(not(feature = "mock"))]
impl Fetchers {
    pub fn default() -> Self {
        Self {
            day_to_day: FetchByDayDay {},
            day_to_hour: FetchByDayHour {},
            hour_to_day: FetchByHourDay {},
            hour_to_hour: FetchByHourHour {},
            day: FetchByDay {},
            hour: FetchByHour {},
            get_latest: GetLatestEntry {},
        }
    }
}
#[cfg(feature = "mock")]
impl Fetchers {
    pub fn default() -> Self {
        Self {
            day_to_day: FetchByDayDay::new(),
            day_to_hour: FetchByDayHour::new(),
            hour_to_day: FetchByHourDay::new(),
            hour_to_hour: FetchByHourHour::new(),
            day: FetchByDay::new(),
            hour: FetchByHour::new(),
            get_latest: GetLatestEntry::new(),
        }
    }
}
