use dna_help::{fetch_links, ActionType, EntryAndHash, WrappedAgentPubKey};
use hdk::prelude::*;

pub const MEMBER_PATH: &str = "member";

// This is a reference to the agent address for any users who have joined this DHT
#[hdk_entry(id = "member")]
#[derive(Clone, PartialEq)]
pub struct Member {
    pub address: WrappedAgentPubKey,
}

impl From<EntryAndHash<Member>> for Member {
    fn from(entry_and_hash: EntryAndHash<Member>) -> Self {
        entry_and_hash.0
    }
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct VecMember(Vec<Member>);

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

#[hdk_extern]
pub fn fetch_members(_: ()) -> ExternResult<VecMember> {
    let path_hash = Path::from(MEMBER_PATH).hash()?;
    let entries = fetch_links::<Member, Member>(path_hash, GetOptions::content())?;
    Ok(VecMember(entries))
}
