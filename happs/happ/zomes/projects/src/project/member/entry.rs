use hdk::prelude::*;
use hdk_crud::signals::ActionType;
use holo_hash::AgentPubKeyB64;
use projects_integrity::{project::member::entry::Member, EntryTypes, LinkTypes};

pub const MEMBER_PATH: &str = "member";

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
    let path = Path::from(MEMBER_PATH).typed(LinkTypes::All)?;
    path.ensure()?;

    // while joining, list me in the list of members
    // so that all peers can become aware of the new presence
    let member_path_address = path.path_entry_hash()?;
    let member = Member {
        agent_pub_key: AgentPubKeyB64::new(agent_info()?.agent_initial_pubkey),
    };
    let member_entry_hash = hash_entry(&member)?;
    create_entry(EntryTypes::Member(member))?;
    create_link(
        member_path_address,
        member_entry_hash,
        LinkTypes::All,
        LinkTag::from(()),
    )?;

    Ok(())
}
