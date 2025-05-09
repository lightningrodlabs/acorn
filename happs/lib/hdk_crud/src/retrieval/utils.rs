use hdk::prelude::*;

/// convert a SignedActionHashed which are like raw contents
/// into the ActionHash of itself
pub fn get_action_hash(signed_action_hashed: SignedActionHashed) -> ActionHash {
    signed_action_hashed.as_hash().to_owned()
}
