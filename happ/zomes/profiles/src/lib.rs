

use std::collections::BTreeMap;

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

fn get_peers_to_signal() -> ExternResult<Vec<AgentPubKey>> {
    // Function to get peers
}

#[hdk_extern]
pub fn create_profile(entry: Profile) -> ExternResult<WireRecord<Profile>> {
    let entry_hash = hash_entry(&entry)?;

    // commit this new profile
    let action_hash = create_entry(EntryTypes::Profile(entry.clone()))?;

    // list profile so anyone can see it
    let agents_path_address = Path::from(AGENTS_PATH).path_entry_hash()?;
    create_link(
        agents_path_address,
        entry_hash.clone(),
        LinkTypes::Profile,
        LinkTag::from(()),
    )?;

    // list profile so the owner can quickly look it up
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
