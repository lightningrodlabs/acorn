use hdk::prelude::*;
use holo_hash::{EntryHashB64, ActionHashB64};

#[doc = "This data structure will be very broadly useful and represents
          how an entry should be serialized along with what metadata to
          form a consistent pattern that the UI or client can expect.
          It is called `WireRecord` because it is how data looks passed
          'over the wire' or network."]
/// It serializes with camelCase style replacement of underscores in object keys.
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct WireRecord<T> {
    pub action_hash: ActionHashB64,
    pub entry_hash: EntryHashB64,
    pub entry: T,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}