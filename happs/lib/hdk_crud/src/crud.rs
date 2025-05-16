/// A macro to go quick and easy
/// from having just a Holochain entry definition
/// to having a full create-read-update-delete set of
/// functionality in your Zome, "signals" (events), as well as
/// time based indexing and queries.
/// See [example] for a comprehensive look at how this works.
/// ```ignore
/// use hdk::prelude::*;
/// use hdk_crud::*;
///
/// #[hdk_entry_helper]
/// #[derive(Clone, PartialEq)]
/// pub struct Example {
///     pub number: i32,
/// }
///
/// #[hdk_entry_defs]
/// #[unit_enum(UnitEntryTypes)]
/// #[derive(Clone)]
/// pub enum EntryTypes {
///     #[entry_def(required_validations = 5)]
///     Example(Example),
/// }
///
/// #[hdk_link_types]
/// pub enum LinkTypes {
///     All,
/// }
///
/// // TestSignal pops out of the crud! macro
/// #[derive(Debug, Serialize, Deserialize, SerializedBytes)]
/// #[serde(untagged)]
/// pub enum SignalTypes {
///     Example(ActionSignal<Example>),
/// }
/// impl From<ActionSignal<Example>> for SignalTypes {
///     fn from(value: ActionSignal<Example>) -> Self {
///         SignalTypes::Example(value)
///     }
/// }
///
/// pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
///     Ok(emit_signal(&signal)?)
/// }
///
/// pub fn get_peers() -> ExternResult<Vec<AgentPubKey>> {
///     Ok(Vec::new())
/// }
///
/// crud!(
///   Example,
///   EntryTypes,
///   EntryTypes::Example,
///   LinkTypes,
///   LinkTypes::All,
///   example,
///   "example",
///   get_peers,
///   SignalTypes
/// );
/// ```
#[macro_export]
macro_rules! crud {
    (
      $crud_type:ident, $entry_types:ident, $entry_type:expr, $link_types:ident, $link_type:expr, $i:ident, $path:expr, $get_peers:ident, $signal_type:ident
    ) => {
        ::paste::paste! {

          /// This is the &str that can be passed into Path to
          /// find all the entries created using these create functions
          /// which are linked off of this Path.
          pub const [<$i:upper _PATH>]: &str = $path;

          /// Retrieve the Path for these entry types
          /// to which all entries are linked
          pub fn [<get_ $i _path>]<TY, E>(link_type: TY) -> ExternResult<TypedPath>
          where
            ScopedLinkType: TryFrom<TY, Error = E>,
            WasmError: From<E>,
          {
            Path::from([<$i:upper _PATH>]).typed(link_type)
          }

          #[doc ="This is what is expected by a call to [update_" $path "]"]
          #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
          #[serde(rename_all = "camelCase")]
          pub struct [<$crud_type UpdateInput>] {
            pub entry: $crud_type,
            pub action_hash: ::holo_hash::ActionHashB64,
          }

          /*
            CREATE
          */

          #[cfg(not(feature = "exclude_zome_fns"))]
          /// This is the exposed/public Zome function for creating an entry of this type.
          /// This will create an entry and link it off the main Path.
          /// It will send a signal of this event
          /// to all peers returned by the `get_peers` call given during the macro call to `crud!`
          #[hdk_extern]
          pub fn [<create_ $i>](entry: $crud_type) -> ExternResult<$crate::wire_record::WireRecord<[<$crud_type>]>> {
            let do_create = $crate::modify_chain::do_create::DoCreate {};
            // wrap it in its EntryTypes variant
            let full_entry = $entry_type(entry.clone());
            do_create.do_create::<$entry_types, $crud_type, ::hdk::prelude::WasmError, $signal_type, $link_types> (
              full_entry,
              entry,
              Some($crate::modify_chain::do_create::TypedPathOrEntryHash::TypedPath([< get_ $i _path >]($link_type)?)),
              $path.to_string(),
              $link_type,
              Some($get_peers()?),
              None,
            )
          }

          /*
            READ
          */

          #[cfg(not(feature = "exclude_zome_fns"))]
          /// This is the exposed/public Zome function for either fetching ALL or a SPECIFIC list of the entries of the type.
          /// No signals will be sent as a result of calling this.
          /// Notice that it pluralizes the value of `$i`, the second argument to the crud! macro call.
          #[hdk_extern]
          pub fn [<fetch_ $i s>](fetch_options: $crate::retrieval::inputs::FetchOptions) -> ExternResult<Vec<$crate::wire_record::WireRecord<[<$crud_type>]>>> {
            let do_fetch = $crate::modify_chain::do_fetch::DoFetch {};
            let fetch_entries = $crate::retrieval::fetch_entries::FetchEntries {};
            let fetch_links = $crate::retrieval::fetch_links::FetchLinks {};
            let get_latest = $crate::retrieval::get_latest_for_entry::GetLatestEntry {};
            let link_type_filter = LinkTypeFilter::try_from($link_type)?;
            do_fetch.do_fetch::<$crud_type, ::hdk::prelude::WasmError>(
                &fetch_entries,
                &fetch_links,
                &get_latest,
                fetch_options,
                GetOptions::network(),
                link_type_filter,
                None, // link_tag
                [< get_ $i _path >]($link_type)?,
            )
          }

          /*
            UPDATE
          */

          #[cfg(not(feature = "exclude_zome_fns"))]
          /// This is the exposed/public Zome function for creating an entry of this type.
          /// This will add an update to an entry.
          /// It will send a signal of this event
          /// to all peers returned by the `get_peers` call given during the macro call to `crud!`
          #[hdk_extern]
          pub fn [<update_ $i>](update: [<$crud_type UpdateInput>]) -> ExternResult<$crate::wire_record::WireRecord<[<$crud_type>]>> {
            let do_update = $crate::modify_chain::do_update::DoUpdate {};
            do_update.do_update::<$crud_type, ::hdk::prelude::WasmError, $signal_type, $link_types>(
              update.entry,
              update.action_hash,
              $path.to_string(),
              $link_type,
              Some($get_peers()?),
              None,
            )
          }

          /*
            DELETE
          */

          #[cfg(not(feature = "exclude_zome_fns"))]
          /// This is the exposed/public Zome function for archiving an entry of this type.
          /// This will mark the entry at `address` as "deleted".
          #[doc="It will no longer be returned by [fetch_" $i "s]."]
          /// It will send a signal of this event
          /// to all peers returned by the `get_peers` call given during the macro call to `crud!`
          #[hdk_extern]
          pub fn [<delete_ $i>](address: ::holo_hash::ActionHashB64) -> ExternResult<::holo_hash::ActionHashB64> {
            let do_delete = $crate::modify_chain::do_delete::DoDelete {};
            do_delete.do_delete::<$crud_type, ::hdk::prelude::WasmError, $signal_type>(
              address,
              $path.to_string(),
              Some($get_peers()?),
            )
          }
        }
    };
}

/// Take a look at this module to get a concrete example
/// of what you need to pass to the crud! macro, as well
/// as what you'll get back out of it.
/// Anything that says "NOT GENERATED" is not
/// generated by the crud! macro call, and the rest is.
/// It will generate 4 public Zome functions
/// The 4 Zome functions in this example would be:
/// [create_example](example::create_example), [fetch_examples](example::fetch_examples), [update_example](example::update_example), and [delete_example](example::delete_example).
#[cfg(not(feature = "no_example"))]
pub mod example {
    use crate::signals::*;
    use hdk::prelude::*;

    /// NOT GENERATED
    /// This is our example hdk_entry entry
    /// type definition.
    #[hdk_entry_helper]
    #[derive(Clone, PartialEq)]
    pub struct Example {
        pub number: i32,
    }

    #[hdk_entry_types]
    #[unit_enum(UnitEntryTypes)]
    #[derive(Clone)]
    pub enum EntryTypes {
        #[entry_type(required_validations = 5)]
        Example(Example),
    }

    #[hdk_link_types]
    pub enum LinkTypes {
        All,
    }

    /// NOT GENERATED
    /// A high level signal type to unify all the entry type specific
    /// signal types. Must implement the `From<ActionSignal<Example>>` trait
    #[derive(Debug, Serialize, Deserialize, SerializedBytes)]
    // untagged because the useful tagging is done internally on the ActionSignal objects
    #[serde(untagged)]
    pub enum SignalTypes {
        Example(ActionSignal<Example>),
    }
    impl From<ActionSignal<Example>> for SignalTypes {
        fn from(value: ActionSignal<Example>) -> Self {
            SignalTypes::Example(value)
        }
    }

    /// NOT GENERATED
    /// Signal Receiver
    /// (forwards signals to the UI)
    /// would be handling a
    pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
        Ok(emit_signal(&signal)?)
    }

    /// NOT GENERATED
    /// This handles the fetching of a list of peers to which to send
    /// signals. In this example it's an empty list. Your function
    /// signature should match this function signature.
    pub fn get_peers() -> ExternResult<Vec<AgentPubKey>> {
        Ok(Vec::new())
    }

    #[cfg(not(feature = "mock"))]
    crud!(
        Example,
        EntryTypes,
        EntryTypes::Example,
        LinkTypes,
        LinkTypes::All,
        example,
        "example",
        get_peers,
        SignalTypes
    );
}
