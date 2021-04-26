use super::entry::{Member, MemberSignal, VecMember, MEMBER_PATH};
use crate::get_peers_latest;
use dna_help::{fetch_links, signal_peers, WrappedAgentPubKey};
use hdk::prelude::*;

// returns a list of the agent addresses of those who
// are "members" of this project, as in, they have joined the project
#[hdk_extern]
pub fn fetch_members(_: ()) -> ExternResult<VecMember> {
    let path_hash = Path::from(MEMBER_PATH).hash()?;
    let entries = fetch_links::<Member, Member>(path_hash, GetOptions::content())?;
    Ok(VecMember(entries))
}

// this is not done during init because it can be slow/uncertain, and shouldn't block init
// send update to peers alerting them that you joined
#[hdk_extern]
pub fn init_signal(_: ()) -> ExternResult<()> {
    let member = Member {
        address: WrappedAgentPubKey(agent_info()?.agent_initial_pubkey),
    };
    signal_peers(&MemberSignal::new(member.clone()), get_peers_latest)
}
