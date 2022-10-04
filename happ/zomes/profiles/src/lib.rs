use hdk::prelude::*;
use hdk_crud::{
    retrieval::{fetch_links::FetchLinks, get_latest_for_entry::GetLatestEntry},
    signals::{create_receive_signal_cap_grant, ActionType},
    wire_record::WireRecord,
};
use holo_hash::{ActionHashB64, AgentPubKeyB64, EntryHashB64};
use profiles_integrity::{EntryTypes, LinkTypes, Profile};

pub const AGENTS_PATH: &str = "agents";

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Path::from(AGENTS_PATH)
        .typed(LinkTypes::Profile)?
        .ensure()?;
    create_receive_signal_cap_grant()?;
    Ok(InitCallbackResult::Pass)
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone, PartialEq)]
pub struct WhoAmIOutput(Option<WireRecord<Profile>>);

#[hdk_extern]
pub fn create_whoami(entry: Profile) -> ExternResult<WireRecord<Profile>> {
    // commit this new profile
    inner_create_whoami(entry, get_peers)
}

pub fn inner_create_whoami(
    entry: Profile,
    get_peers_to_signal: fn() -> ExternResult<Vec<AgentPubKey>>,
) -> ExternResult<WireRecord<Profile>> {
    let entry_hash = hash_entry(&entry)?;

    // commit this new profile
    let action_hash = create_entry(EntryTypes::Profile(entry.clone()))?;

    // list me so anyone can see my profile
    let agents_path_address = Path::from(AGENTS_PATH).path_entry_hash()?;
    create_link(
        agents_path_address,
        entry_hash.clone(),
        LinkTypes::Profile,
        LinkTag::from(()),
    )?;

    // list me so I can specifically and quickly look up my profile
    let agent_pubkey = agent_info()?.agent_initial_pubkey;
    let agent_entry_hash = EntryHash::from(agent_pubkey);
    create_link(
        agent_entry_hash,
        entry_hash.clone(),
        LinkTypes::Profile,
        LinkTag::from(()),
    )?;

    let time = sys_time()?;
    let wire_record: WireRecord<Profile> = WireRecord {
        entry,
        action_hash: ActionHashB64::new(action_hash),
        entry_hash: EntryHashB64::new(entry_hash),
        created_at: time,
        updated_at: time,
    };

    // we don't want to cause real failure for inability to send to peers
    let signal = SignalType::Agent(AgentSignal {
        entry_type: agent_signal_entry_type(),
        action: ActionType::Create,
        data: SignalData::Create(wire_record.clone()),
    });
    let _ = send_agent_signal(signal, get_peers_to_signal);

    Ok(wire_record)
}

#[hdk_extern]
pub fn create_imported_profile(entry: Profile) -> ExternResult<WireRecord<Profile>> {
    let entry_hash = hash_entry(&entry)?;
    // commit this new profile
    let action_hash = create_entry(EntryTypes::Profile(entry.clone()))?;
    // list profile so anyone can see it
    let agents_path_address = Path::from(AGENTS_PATH).path_entry_hash()?;
    create_link(
        agents_path_address,
        entry_hash.clone(),
        LinkTypes::Profile,
        LinkTag::from(Vec::new()),
    )?;
    // list profile so the owner can quickly look it up
    let agent_pubkey = AgentPubKey::from(entry.clone().agent_pub_key);
    let agent_entry_hash = EntryHash::from(agent_pubkey);
    create_link(
        agent_entry_hash,
        entry_hash.clone(),
        LinkTypes::Profile,
        LinkTag::from(()),
    )?;
    let time = sys_time()?;
    Ok(WireRecord {
        entry,
        action_hash: ActionHashB64::new(action_hash),
        entry_hash: EntryHashB64::new(entry_hash),
        created_at: time,
        updated_at: time,
    })
}

pub fn agent_signal_entry_type() -> String {
    "agent".to_string()
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInput {
    pub action_hash: ActionHashB64,
    pub entry: Profile,
}

#[hdk_extern]
pub fn update_whoami(update: UpdateInput) -> ExternResult<WireRecord<Profile>> {
    inner_update_whoami(update, get_peers)
}

pub fn inner_update_whoami(
    update: UpdateInput,
    get_peers_to_signal: fn() -> ExternResult<Vec<AgentPubKey>>,
) -> ExternResult<WireRecord<Profile>> {
    update_entry(update.action_hash.clone().into(), &update.entry)?;
    let entry_hash = hash_entry(update.entry.clone())?;
    let time = sys_time()?;
    let wire_record = WireRecord {
        entry: update.entry,
        action_hash: update.action_hash,
        entry_hash: EntryHashB64::new(entry_hash),
        created_at: time,
        updated_at: time,
    };
    // // send update to peers
    // we don't want to cause real failure for inability to send to peers
    let signal = SignalType::Agent(AgentSignal {
        entry_type: agent_signal_entry_type(),
        action: ActionType::Update,
        data: SignalData::Update(wire_record.clone()),
    });
    let _ = send_agent_signal(signal, get_peers_to_signal);
    Ok(wire_record)
}

#[hdk_extern]
pub fn whoami(_: ()) -> ExternResult<WhoAmIOutput> {
    let agent_pubkey = agent_info()?.agent_initial_pubkey;
    let agent_entry_hash = EntryHash::from(agent_pubkey);

    let all_profiles = get_links(agent_entry_hash, LinkTypes::Profile, None)?;
    
    let all_fetched_maybe_profiles = all_profiles.into_iter()
        .map(|link|{
            let get_latest = GetLatestEntry {};
            get_latest.get_latest_for_entry::<Profile>(
                link.target.clone().into(),
                GetOptions::content(),
            )
        })
        .collect::<ExternResult<Vec<Option<WireRecord<Profile>>>>>()?;

    let all_fetched_profiles = all_fetched_maybe_profiles.into_iter()
        .filter_map(|maybe_profile| {
            maybe_profile
        })
        .collect::<Vec<WireRecord<Profile>>>();
    let copied_all_profiles = all_fetched_profiles.clone();
    match all_fetched_profiles.into_iter()    
        .find(|wire_record| !wire_record.entry.is_imported) {
            Some(profile) => Ok(WhoAmIOutput(Some(profile))),
            None => match copied_all_profiles.last() {
                Some(last_profile) => Ok(WhoAmIOutput(Some(last_profile.clone()))),
                None => Ok(WhoAmIOutput(None)),
            }
        }
}

#[hdk_extern]
pub fn fetch_agents(_: ()) -> ExternResult<Vec<Profile>> {
    let path_hash = Path::from(AGENTS_PATH).path_entry_hash()?;
    let get_latest = GetLatestEntry {};
    let fetch_links = FetchLinks {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::Profile)?;
    let entries = fetch_links
        .fetch_links::<Profile>(
            &get_latest,
            path_hash,
            link_type_filter,
            None,
            GetOptions::content(),
        )?
        .into_iter()
        // TODO: this should deduplicate results where the .agent_pub_key
        // is the same. It should be specific and pick/prefer one where
        // profile.is_imported is `false`.
        .map(|wire_record| wire_record.entry)
        .collect();
    Ok(entries)
}

#[hdk_extern]
fn fetch_agent_address(_: ()) -> ExternResult<AgentPubKeyB64> {
    let agent_info = agent_info()?;
    Ok(AgentPubKeyB64::new(agent_info.agent_initial_pubkey))
}

/*
SIGNALS
*/

fn send_agent_signal(
    signal: SignalType,
    get_peers_to_signal: fn() -> ExternResult<Vec<AgentPubKey>>,
) -> ExternResult<()> {
    let payload =
        ExternIO::encode(signal).map_err(|e| wasm_error!(WasmErrorInner::Serialize(e)))?;
    let peers = get_peers_to_signal()?;
    remote_signal(payload, peers)?;
    Ok(())
}

// used to get addresses of agents to send signals to
fn get_peers() -> ExternResult<Vec<AgentPubKey>> {
    let path_hash = Path::from(AGENTS_PATH).path_entry_hash()?;
    let get_latest = GetLatestEntry {};
    let fetch_links = FetchLinks {};
    let link_type_filter = LinkTypeFilter::try_from(LinkTypes::Profile)?;
    let entries = fetch_links.fetch_links::<Profile>(
        &get_latest,
        path_hash,
        link_type_filter,
        None,
        GetOptions::latest(),
    )?;
    let self_agent_pub_key = AgentPubKeyB64::from(agent_info()?.agent_initial_pubkey);
    Ok(entries
        .into_iter()
        // eliminate yourself as a peer, along with imports
        .filter(|x| x.entry.agent_pub_key != self_agent_pub_key && !x.entry.is_imported)
        .map(|x| AgentPubKey::from(x.entry))
        .collect::<Vec<AgentPubKey>>())
}

// this will be used to send these data structures as signals to the UI
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
#[serde(untagged)]
pub enum SignalData {
    Create(WireRecord<Profile>),
    Update(WireRecord<Profile>),
    Delete(ActionHashB64),
}

// this will be used to send these data structures as signals to the UI
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct AgentSignal {
    pub entry_type: String,
    pub action: ActionType,
    pub data: SignalData,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
// untagged because the useful tagging is done internally on the *Signal objects
#[serde(tag = "signalType", content = "data")]
pub enum SignalType {
    Agent(AgentSignal),
}

// receiver (and forward to UI)
#[hdk_extern]
pub fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let sig: SignalType = signal
        .decode()
        .map_err(|e| wasm_error!(WasmErrorInner::Serialize(e)))?;
    debug!("Received remote signal {:?}", sig);
    Ok(emit_signal(&signal)?)
}
