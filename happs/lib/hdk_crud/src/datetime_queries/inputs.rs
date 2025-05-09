use chrono::{DateTime, Datelike, NaiveDate, Timelike, Utc};
use hdk::prelude::*;
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct FetchEntriesTime {
    pub year: i32,
    pub month: u32,
    pub day: u32,
    pub hour: Option<u32>,
}

impl FetchEntriesTime {
    pub fn to_date_time(&self) -> DateTime<Utc> {
        match self.hour {
            None => DateTime::from_utc(
                NaiveDate::from_ymd(self.year, self.month, self.day).and_hms(0, 0, 0),
                Utc,
            ),
            Some(h) => DateTime::from_utc(
                NaiveDate::from_ymd(self.year, self.month, self.day).and_hms(h, 0, 0),
                Utc,
            ),
        }
    }
    pub fn from_date_time(dt: DateTime<Utc>) -> Self {
        Self {
            year: dt.year(),
            month: dt.month(),
            day: dt.day(),
            hour: Some(dt.hour()),
        }
    }
}
