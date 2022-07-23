use crate::project::connection::crud::Connection;
use crate::project::error::Error;
use hdk::prelude::*;

#[hdk_extern]
/// New connections cannot be self-referential and both the parent and child outcome must exist
pub fn validate_create_entry_connection(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    let proposed_connection = match Connection::try_from(&validate_data.element) {
        Ok(connection) => connection,
        Err(_e) => {
            // early exit the whole function
            return Ok(Error::DeserializationFailed.into());
        }
    };

    // avoid connections to/from self
    // parent and child can't be the same
    if proposed_connection.child_action_hash == proposed_connection.parent_action_hash {
        return Ok(Error::IdenticalParentChild.into());
    }

    // parent outcome, and child outcome, must be determined to exist to pass validation
    must_get_header(proposed_connection.parent_action_hash.into())?;
    must_get_header(proposed_connection.child_action_hash.into())?;
    Ok(ValidateCallbackResult::Valid)
}

#[hdk_extern]
/// Updates are not allowed
pub fn validate_update_entry_connection(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_connection(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
