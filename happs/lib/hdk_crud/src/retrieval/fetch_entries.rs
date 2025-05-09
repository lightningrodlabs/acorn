#[cfg(not(feature = "mock"))]
use crate::retrieval::fetch_links::FetchLinks;
#[cfg(not(feature = "mock"))]
use crate::retrieval::get_latest_for_entry::GetLatestEntry;

#[cfg(feature = "mock")]
use crate::retrieval::fetch_links::MockFetchLinks as FetchLinks;
#[cfg(feature = "mock")]
use crate::retrieval::get_latest_for_entry::MockGetLatestEntry as GetLatestEntry;

#[cfg(feature = "mock")]
use ::mockall::automock;

use crate::retrieval::inputs::FetchOptions;
use crate::wire_record::WireRecord;
use hdk::prelude::*;
use std::convert::identity;

#[derive(Debug, PartialEq, Clone)]
pub struct FetchEntries {}
#[cfg_attr(feature = "mock", automock)]
impl FetchEntries {
    // TODO: change this in such a way that the path is only passed in if it is needed (for fetching all), for example `All(String)` pass in the path as string
    /// Fetch either all entries of a certain type (assuming they are linked to a path) or a specific subset given their entry hashes.
    pub fn fetch_entries<
        EntryType: 'static + TryFrom<SerializedBytes, Error = SerializedBytesError>,
    >(
        &self,
        fetch_links: &FetchLinks,
        get_latest: &GetLatestEntry,
        link_type: LinkTypeFilter,
        link_tag: Option<LinkTag>,
        entry_path: TypedPath, // TODO: see if there is a way to derive this from the entry itself (like from entry id)
        fetch_options: FetchOptions,
        get_options: GetOptions,
    ) -> Result<Vec<WireRecord<EntryType>>, WasmError> {
        match fetch_options {
            FetchOptions::All => {
                let path_hash = entry_path.path_entry_hash()?;
                fetch_links.fetch_links::<EntryType>(
                    get_latest,
                    path_hash,
                    link_type,
                    link_tag,
                    get_options,
                )
                // TODO: will have to instantiate or pass in the struct
            }
            FetchOptions::Specific(vec_entry_hash) => {
                let entries = vec_entry_hash
                    .iter()
                    .map(|entry_hash| {
                        get_latest.get_latest_for_entry::<EntryType>(
                            EntryHash::from(entry_hash.clone()).into(),
                            get_options.clone(),
                        )
                    })
                    // drop Err(_) and unwraps Ok(_)
                    .filter_map(Result::ok)
                    // drop None and unwraps Some(_)
                    .filter_map(identity)
                    .map(|x| WireRecord::from(x))
                    .collect();
                Ok(entries)
            }
        }
    }
}
