use hdk::prelude::*;
use hdk_crud::{retrieval::utils::EntryAndHash, signals::ActionType};
use holo_hash::AgentPubKeyB64;

pub const MEMBER_PATH: &str = "member";

// This is a reference to the agent address for any users who have joined this DHT
#[hdk_entry(id = "member")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Member {
    pub address: AgentPubKeyB64,
}

impl Member {
    pub fn new(address: AgentPubKeyB64) -> Self {
        Self { address }
    }
}

impl From<EntryAndHash<Member>> for Member {
    fn from(entry_and_hash: EntryAndHash<Member>) -> Self {
        entry_and_hash.0
    }
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct MemberSignal {
    entry_type: String,
    action: ActionType,
    data: Member,
}

impl MemberSignal {
    pub fn new(member: Member) -> Self {
        Self {
            entry_type: "member".to_string(),
            action: ActionType::Create,
            data: member,
        }
    }
}

// called during `init` and so is not exposed as zome fn
pub fn join_project_during_init() -> ExternResult<()> {
    Path::from(MEMBER_PATH).ensure()?;

    // while joining, list me in the list of members
    // so that all peers can become aware of the new presence
    let member_path_address = Path::from(MEMBER_PATH).path_entry_hash()?;
    let member = Member {
        address: AgentPubKeyB64::new(agent_info()?.agent_initial_pubkey),
    };
    create_entry(&member)?;
    let member_entry_hash = hash_entry(&member)?;
    create_link(member_path_address, member_entry_hash, ())?;

    Ok(())
}
