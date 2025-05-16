#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;

use crate::wire_record::WireRecord;
use hdk::prelude::*;
use std::convert::identity;

#[cfg(feature = "mock")]
use ::mockall::automock;

#[derive(Debug, PartialEq, Clone)]
pub struct FetchLinks {}
#[cfg_attr(feature = "mock", automock)]
impl FetchLinks {
    /// Fetch and deserialize all the entries of a certain type that are linked to an EntryHash.
    /// Useful for having a Path that you link everything to. This also internally calls [get_latest_for_entry](super::get_latest_for_entry::GetLatestEntry::get_latest_for_entry) meaning
    /// that the contents for each entry returned are automatically the latest contents.
    pub fn fetch_links<
        EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
    >(
        &self,
        get_latest: &GetLatestEntry,
        entry_hash: EntryHash,
        link_type: LinkTypeFilter,
        link_tag: Option<LinkTag>,
        get_options: GetOptions,
    ) -> Result<Vec<WireRecord<EntryType>>, WasmError> {
        let mut input = GetLinksInputBuilder::try_new(entry_hash, link_type)?;
        if let Some(link_tag_inner) = link_tag {
            input = input.tag_prefix(link_tag_inner);
        }
        Ok(get_links(input.build())?
            .into_iter()
            .map(|link: Link| {
                get_latest.get_latest_for_entry::<EntryType>(
                    link.target.try_into().map_err(|_| {
                        wasm_error!(WasmErrorInner::Guest("Target is not an entry".to_string()))
                    })?,
                    get_options.clone(),
                )
            })
            .filter_map(Result::ok)
            .filter_map(identity)
            .map(|x| WireRecord::from(x))
            .collect())
    }
}
