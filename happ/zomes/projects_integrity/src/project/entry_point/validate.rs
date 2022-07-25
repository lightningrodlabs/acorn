use crate::project::error::Error;
use crate::project::{
    entry_point::crud::EntryPoint, validate::validate_value_matches_create_author,
};
use hdk::prelude::*;

#[hdk_extern]
/// The `Outcome` at the `outcome_action_hash` on the `EntryPoint` must exist and the `creator_agent_pub_key` of the
/// `EntryPoint` must match the agent authoring the `EntryPoint`, unless the entry is imported
pub fn validate_create_entry_entry_point(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match EntryPoint::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // header for parent Outcome at outcome_action_hash must be determined to exist
                must_get_header(proposed_entry.outcome_action_hash.into())?;
                // an imported entry can have another listed as author
                if proposed_entry.is_imported {
                    ValidateCallbackResult::Valid
                } else {
                    // creator_agent_pub_key must match header author
                    validate_value_matches_create_author(
                        &proposed_entry.creator_agent_pub_key.into(),
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
