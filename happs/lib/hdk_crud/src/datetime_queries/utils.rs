use super::inputs::FetchEntriesTime;
use chrono::{DateTime, Datelike, Duration, NaiveDate, Utc};
use hdk::prelude::*;

pub fn is_valid_date_range(
    start: FetchEntriesTime,
    end: FetchEntriesTime,
) -> Result<(), WasmError> {
    match start.to_date_time() < end.to_date_time() {
        // Here is where we could allow for start and end to be equal
        true => Ok(()),
        false => Err(err("invalid date range")),
    }
}
pub fn next_day(date_time: DateTime<Utc>) -> DateTime<Utc> {
    let next_day = date_time + Duration::days(1);
    DateTime::from_utc(
        NaiveDate::from_ymd(next_day.year(), next_day.month(), next_day.day()).and_hms(0, 0, 0),
        Utc,
    )
}

pub fn err(reason: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(String::from(reason)))
}
pub fn serialize_err(sbe: SerializedBytesError) -> WasmError {
    wasm_error!(WasmErrorInner::Serialize(sbe))
}

/// used to convert the last component of a path (in this case, the hour of a day) into a string
pub fn get_last_component_string(path_tag: LinkTag) -> ExternResult<String> {
    let component_bytes = &path_tag.0[1..];
    let component: Component = SerializedBytes::from(UnsafeBytes::from(component_bytes.to_vec()))
        .try_into()
        .map_err(serialize_err)?;
    let hour_str: String = String::try_from(&component).map_err(serialize_err)?;
    Ok(hour_str)
}

pub fn day_path_from_date<TY, E>(
    link_type: TY,
    base_component: String,
    year: i32,
    month: u32,
    day: u32,
) -> ExternResult<TypedPath>
where
    ScopedLinkType: TryFrom<TY, Error = E>,
    WasmError: From<E>,
{
    Path::from(format!("{}.{}-{}-{}", base_component, year, month, day)).typed(link_type)
}

pub fn hour_path_from_date<TY, E>(
    link_type: TY,
    base_component: String,
    year: i32,
    month: u32,
    day: u32,
    hour: u32,
) -> ExternResult<TypedPath>
where
    ScopedLinkType: TryFrom<TY, Error = E>,
    WasmError: From<E>,
{
    Path::from(format!(
        "{}.{}-{}-{}.{}",
        base_component, year, month, day, hour
    ))
    .typed(link_type)
}
