use hdk_crud::{ActionType, EntryAndHash, WrappedAgentPubKey};
use hdk::prelude::*;

pub const MEMBER_PATH: &str = "member";

// This is a reference to the agent address for any users who have joined this DHT
#[hdk_entry(id = "member")]
#[derive(Clone, PartialEq)]
pub struct Member {
    pub address: WrappedAgentPubKey,
}

impl Member {
  pub fn new(
    address: WrappedAgentPubKey,
  ) -> Self {
    Self {
      address,
    }
  }
}

impl From<EntryAndHash<Member>> for Member {
    fn from(entry_and_hash: EntryAndHash<Member>) -> Self {
        entry_and_hash.0
    }
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct VecMember(pub Vec<Member>);

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
    let member_path_address = Path::from(MEMBER_PATH).hash()?;
    let member = Member {
        address: WrappedAgentPubKey(agent_info()?.agent_initial_pubkey),
    };
    create_entry(&member)?;
    let member_entry_hash = hash_entry(&member)?;
    create_link(member_path_address, member_entry_hash, ())?;

    Ok(())
}
