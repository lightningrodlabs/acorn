use hdk::prelude::*;
pub use paste;
use std::fmt;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum ActionType {
    Create,
    Update,
    Delete,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
pub struct UIEnum(String);

impl From<UIEnum> for ActionType {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "create" => Self::Create,
            "update" => Self::Update,
            _ => Self::Delete,
        }
    }
}

impl From<ActionType> for UIEnum {
    fn from(action_type: ActionType) -> Self {
        Self(action_type.to_string().to_lowercase())
    }
}

impl fmt::Display for ActionType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

pub type EntryAndHash<T> = (T, HeaderHash, EntryHash);
pub type OptionEntryAndHash<T> = Option<EntryAndHash<T>>;

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
pub struct UIStringHash(String);

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(try_from = "UIStringHash")]
#[serde(into = "UIStringHash")]
pub struct WrappedAgentPubKey(pub AgentPubKey);

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(try_from = "UIStringHash")]
#[serde(into = "UIStringHash")]
pub struct WrappedHeaderHash(pub HeaderHash);

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(try_from = "UIStringHash")]
#[serde(into = "UIStringHash")]
pub struct WrappedEntryHash(pub EntryHash);

impl TryFrom<UIStringHash> for WrappedAgentPubKey {
    type Error = String;
    fn try_from(ui_string_hash: UIStringHash) -> Result<Self, Self::Error> {
        match AgentPubKey::try_from(ui_string_hash.0) {
            Ok(address) => Ok(Self(address)),
            Err(e) => Err(format!("{:?}", e)),
        }
    }
}
impl From<WrappedAgentPubKey> for UIStringHash {
    fn from(wrapped_agent_pub_key: WrappedAgentPubKey) -> Self {
        Self(wrapped_agent_pub_key.0.to_string())
    }
}

impl TryFrom<UIStringHash> for WrappedHeaderHash {
    type Error = String;
    fn try_from(ui_string_hash: UIStringHash) -> Result<Self, Self::Error> {
        match HeaderHash::try_from(ui_string_hash.0) {
            Ok(address) => Ok(Self(address)),
            Err(e) => Err(format!("{:?}", e)),
        }
    }
}
impl From<WrappedHeaderHash> for UIStringHash {
    fn from(wrapped_header_hash: WrappedHeaderHash) -> Self {
        Self(wrapped_header_hash.0.to_string())
    }
}

impl TryFrom<UIStringHash> for WrappedEntryHash {
    type Error = String;
    fn try_from(ui_string_hash: UIStringHash) -> Result<Self, Self::Error> {
        match EntryHash::try_from(ui_string_hash.0) {
            Ok(address) => Ok(Self(address)),
            Err(e) => Err(format!("{:?}", e)),
        }
    }
}
impl From<WrappedEntryHash> for UIStringHash {
    fn from(wrapped_entry_hash: WrappedEntryHash) -> Self {
        Self(wrapped_entry_hash.0.to_string())
    }
}

/*
  SIGNALS
*/

// sender
pub fn signal_peers<'a, I: 'a>(
    signal: &'a I,
    get_peers: fn() -> ExternResult<Vec<AgentPubKey>>,
) -> ExternResult<()>
where
    I: serde::Serialize + std::fmt::Debug,
{
    let peers = get_peers()?;
    remote_signal(&signal, peers)?;
    Ok(())
}

pub fn create_receive_signal_cap_grant() -> ExternResult<()> {
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info()?.zome_name, "recv_remote_signal".into()));

    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        // empty access converts to unrestricted
        access: ().into(),
        functions,
    })?;
    Ok(())
}

pub fn get_header_hash(shh: element::SignedHeaderHashed) -> HeaderHash {
    shh.header_hashed().as_hash().to_owned()
}

pub fn get_latest_for_entry<T: TryFrom<SerializedBytes, Error = SerializedBytesError>>(
    entry_hash: EntryHash,
    get_options: GetOptions,
) -> ExternResult<OptionEntryAndHash<T>> {
    // First, make sure we DO have the latest header_hash address
    let maybe_latest_header_hash = match get_details(entry_hash.clone(), get_options.clone())? {
        Some(Details::Entry(details)) => match details.entry_dht_status {
            metadata::EntryDhtStatus::Live => match details.updates.len() {
                // pass out the header associated with this entry
                0 => Some(get_header_hash(details.headers.first().unwrap().to_owned())),
                _ => {
                    let mut sortlist = details.updates.to_vec();
                    // unix timestamp should work for sorting
                    sortlist.sort_by_key(|update| update.header().timestamp().0);
                    // sorts in ascending order, so take the last element
                    let last = sortlist.last().unwrap().to_owned();
                    Some(get_header_hash(last))
                }
            },
            metadata::EntryDhtStatus::Dead => None,
            _ => None,
        },
        _ => None,
    };

    // Second, go and get that element, and return it and its header_address
    match maybe_latest_header_hash {
        Some(latest_header_hash) => match get(latest_header_hash, get_options)? {
            Some(element) => match element.entry().to_app_option::<T>()? {
                Some(entry) => Ok(Some((
                    entry,
                    match element.header() {
                        // we DO want to return the header for the original
                        // instead of the updated, in our case
                        Header::Update(update) => update.original_header_address.clone(),
                        Header::Create(_) => element.header_address().clone(),
                        _ => unreachable!("Can't have returned a header for a nonexistent entry"),
                    },
                    element.header().entry_hash().unwrap().to_owned(),
                ))),
                None => Ok(None),
            },
            None => Ok(None),
        },
        None => Ok(None),
    }
}

pub fn fetch_links<
    EntryType: TryFrom<SerializedBytes, Error = SerializedBytesError>,
    WireEntry: From<EntryAndHash<EntryType>>,
>(
    entry_hash: EntryHash,
    get_options: GetOptions,
) -> Result<Vec<WireEntry>, WasmError> {
    Ok(get_links(entry_hash, None)?
        .into_inner()
        .into_iter()
        .map(|link: link::Link| {
            get_latest_for_entry::<EntryType>(link.target.clone(), get_options.clone())
        })
        .filter_map(Result::ok)
        .filter_map(|x| x)
        .map(|x| WireEntry::from(x))
        .collect())
}

#[macro_export]
macro_rules! crud {
    (
      $crud_type:ident, $i:ident, $path:expr, $get_peers:ident, $convert_to_receiver_signal:ident
    ) => {

        $crate::paste::paste! {
          pub const [<$i:upper _PATH>]: &str = $path;

          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          pub struct [<$crud_type WireEntry>] {
            pub entry: $crud_type,
            pub address: $crate::WrappedHeaderHash,
            pub entry_address: $crate::WrappedEntryHash
          }

          // this will be used to send these data structures as signals to the UI
          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          // untagged because the useful tagging is done externally on the *Signal object
          // as the tag and action
          #[serde(untagged)]
          pub enum [<$crud_type SignalData>] {
            Create([<$crud_type WireEntry>]),
            Update([<$crud_type WireEntry>]),
            Delete($crate::WrappedHeaderHash),
          }

          // this will be used to send these data structures as signals to the UI
          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          pub struct [<$crud_type Signal>] {
            pub entry_type: String,
            pub action: $crate::ActionType,
            pub data: [<$crud_type SignalData>],
          }

          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          pub struct [<$crud_type UpdateInput>] {
            pub entry: $crud_type,
            pub address: $crate::WrappedHeaderHash,
          }

          impl From<$crate::EntryAndHash<$crud_type>> for [<$crud_type WireEntry>] {
            fn from(entry_and_hash: $crate::EntryAndHash<$crud_type>) -> Self {
              [<$crud_type WireEntry>] {
                entry: entry_and_hash.0,
                address: $crate::WrappedHeaderHash(entry_and_hash.1),
                entry_address: $crate::WrappedEntryHash(entry_and_hash.2)
              }
            }
          }

          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          pub struct [<Vec $crud_type WireEntry>](pub Vec<[<$crud_type WireEntry>]>);

          /*
            CREATE
          */
          pub fn [<inner_create_ $i>](entry: $crud_type, send_signal: bool) -> ExternResult<[<$crud_type WireEntry>]> {
            let address = create_entry(&entry)?;
            let entry_hash = hash_entry(&entry)?;
            let path = Path::from([<$i:upper _PATH>]);
            let start_ensure_time: std::time::Duration = sys_time()?;
            debug!("start! of Path.ensure() time {:?}", start_ensure_time.clone());
            path.ensure()?;
            let end_ensure_time: std::time::Duration = sys_time()?;
            debug!("end! of Path.ensure() time {:?}", end_ensure_time.clone());
            let path_hash = path.hash()?;
            create_link(path_hash, entry_hash.clone(), ())?;
            let wire_entry = [<$crud_type WireEntry>] {
              entry,
              address: $crate::WrappedHeaderHash(address),
              entry_address: $crate::WrappedEntryHash(entry_hash)
            };
            if (send_signal) {
              let start_signal_time: std::time::Duration = sys_time()?;
              debug!("start!! of signal time {:?}", start_signal_time.clone());
              let signal = $convert_to_receiver_signal([<$crud_type Signal>] {
                entry_type: $path.to_string(),
                action: $crate::ActionType::Create,
                data: [<$crud_type SignalData>]::Create(wire_entry.clone()),
              });
              let _ = $crate::signal_peers(&signal, $get_peers);
              let end_signal_time: std::time::Duration = sys_time()?;
              debug!("end!! of signal time {:?}", end_signal_time.clone());
            }
            Ok(wire_entry)
          }

          #[hdk_extern]
          pub fn [<create_ $i>](entry: $crud_type) -> ExternResult<[<$crud_type WireEntry>]> {
            [<inner_create_ $i>](entry, true)
          }

          /*
            READ
          */
          pub fn [<inner_fetch_ $i s>](get_options: GetOptions) -> ExternResult<[<Vec $crud_type WireEntry>]> {
            let path_hash = Path::from([<$i:upper _PATH>]).hash()?;
            let entries = $crate::fetch_links::<$crud_type, [<$crud_type WireEntry>]>(path_hash, get_options)?;
            Ok([<Vec $crud_type WireEntry>](entries))
          }

          #[hdk_extern]
          pub fn [<fetch_ $i s>](_: ()) -> ExternResult<[<Vec $crud_type WireEntry>]> {
            [<inner_fetch_ $i s>](GetOptions::latest())
          }

          /*
            UPDATE
          */
          pub fn [<inner_update_ $i>](update: [<$crud_type UpdateInput>], send_signal: bool) -> ExternResult<[<$crud_type WireEntry>]> {
            update_entry(update.address.0.clone(), &update.entry)?;
            let entry_address = hash_entry(&update.entry)?;
            let wire_entry = [<$crud_type WireEntry>] {
                entry: update.entry,
                address: update.address,
                entry_address: $crate::WrappedEntryHash(entry_address)
            };
            if (send_signal) {
              let signal = $convert_to_receiver_signal([<$crud_type Signal>] {
                entry_type: $path.to_string(),
                action: $crate::ActionType::Update,
                data: [<$crud_type SignalData>]::Update(wire_entry.clone()),
              });
              let _ = $crate::signal_peers(&signal, $get_peers);
            }
            Ok(wire_entry)
          }

          #[hdk_extern]
          pub fn [<update_ $i>](update: [<$crud_type UpdateInput>]) -> ExternResult<[<$crud_type WireEntry>]> {
            [<inner_update_ $i>](update, true)
          }

          /*
            DELETE
          */
          pub fn [<inner_archive_ $i>](address: $crate::WrappedHeaderHash, send_signal: bool) -> ExternResult<$crate::WrappedHeaderHash> {
            delete_entry(address.0.clone())?;
            if (send_signal) {
              let signal = $convert_to_receiver_signal([<$crud_type Signal>] {
                entry_type: $path.to_string(),
                action: $crate::ActionType::Delete,
                data: [<$crud_type SignalData>]::Delete(address.clone()),
              });
              let _ = $crate::signal_peers(&signal, $get_peers);
            }
            Ok(address)
          }

          #[hdk_extern]
          pub fn [<archive_ $i>](address: $crate::WrappedHeaderHash) -> ExternResult<$crate::WrappedHeaderHash> {
            [<inner_archive_ $i>](address, true)
          }
        }
    };
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
