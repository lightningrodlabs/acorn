use crate::project::{
    error::Error, member::entry::Member, validate::validate_value_matches_create_author,
};
use hdk::prelude::*;

#[hdk_extern]
/// Creates allowed if the member `address` matches the author of the entry
pub fn validate_create_entry_member(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match Member::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                //  agent_pub_key` must match header author
                validate_value_matches_create_author(&proposed_entry.agent_pub_key.into(), &validate_data)
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Updates aren't allowed
pub fn validate_update_entry_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(Error::UpdateAttempted.into())
}

#[hdk_extern]
/// Deletes aren't allowed
pub fn validate_delete_entry_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(Error::DeleteAttempted.into())
}
