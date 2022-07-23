use crate::project::error::Error;
use crate::project::{
    outcome_member::crud::OutcomeMember, validate::validate_value_matches_create_author,
};
use hdk::prelude::*;

#[hdk_extern]
/// Creates are allowed if the Outcome exists and if `creator_agent_pub_key` matches
/// the agent authoring the entry (unless `is_imported` is `true`)
pub fn validate_create_entry_outcome_member(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match OutcomeMember::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // parent outcome at outcome_action_hash must be determined to exist
                must_get_header(proposed_entry.outcome_action_hash.into())?;

                // an imported entry can have another listed as author, and an edit history
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
pub fn validate_update_entry_outcome_member(
    _: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_outcome_member(
    _: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
