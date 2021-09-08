use crate::project::{
    entry_point::crud::EntryPoint, validate::validate_value_matches_create_author,
};
use crate::project::{error::Error};
use hdk::prelude::*;

#[hdk_extern]
/// The `Goal` at the `goal_address` on the `EntryPoint` must exist and the `creator_address` of the
/// `EntryPoint` must match the agent authoring the `EntryPoint`, unless the entry is imported
pub fn validate_create_entry_entry_point(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match EntryPoint::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // header for parent Goal at goal_address must be determined to exist
                must_get_header(proposed_entry.goal_address.0)?;
                // an imported entry can have another listed as author
                if proposed_entry.is_imported {
                    ValidateCallbackResult::Valid
                } else {
                    // creator_address must match header author
                    validate_value_matches_create_author(
                        &proposed_entry.creator_address.0,
                        &validate_data,
                    )
                }
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Updates are not allowed
pub fn validate_update_entry_entry_point(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_entry_point(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
