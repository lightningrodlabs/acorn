use crate::datetime_queries::utils::hour_path_from_date;
use crate::wire_record::WireRecord;
use hdk::prelude::*;

#[cfg(feature = "mock")]
use ::mockall::automock;
use std::convert::identity;

#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;
pub struct FetchByHour {}
#[cfg_attr(feature = "mock", automock)]
impl FetchByHour {
    /// fetches all entries linked to a time path index for a particular hour on a specific day
    pub fn fetch_entries_by_hour<
        EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
        TY,
        E,
    >(
        &self,
        get_latest_entry: &GetLatestEntry,
        link_type_filter: LinkTypeFilter,
        link_type: TY,
        year: i32,
        month: u32,
        day: u32,
        hour: u32,
        base_component: String,
    ) -> Result<Vec<WireRecord<EntryType>>, WasmError>
    where
        ScopedLinkType: TryFrom<TY, Error = E>,
        TY: Clone,
        WasmError: From<E>,
    {
        let path = hour_path_from_date(link_type, base_component.clone(), year, month, day, hour)?;
        let input = GetLinksInputBuilder::try_new(path.path_entry_hash()?, link_type_filter)?;
        let links = get_links(input.build())?;

        let entries: Vec<WireRecord<EntryType>> = links
            .into_iter()
            .map(|link| {
                get_latest_entry.get_latest_for_entry::<EntryType>(
                    link.target.try_into().map_err(|_| {
                        wasm_error!(WasmErrorInner::Guest("Target is not an entry".to_string()))
                    })?,
                    GetOptions::network(),
                )
            })
            .filter_map(Result::ok)
            .filter_map(identity)
            .map(|x| WireRecord::from(x))
            .collect::<Vec<WireRecord<EntryType>>>();
        Ok(entries)
    }
}
