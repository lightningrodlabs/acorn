use crate::project::validate::must_get_header_and_entry;
use crate::project::{
    error::Error,
    outcome_comment::crud::OutcomeComment,
    validate::{
        validate_value_matches_create_author, validate_value_matches_original_author_for_edit,
    },
};
use hdk::prelude::*;

#[hdk_extern]
/// `OutcomeComment`s can only be created if the `Outcome` exists and
/// the `creator_agent_pub_key` must match the address of the agent adding
/// the `OutcomeComment`, unless the entry is imported (`is_imported`)
pub fn validate_create_entry_outcome_comment(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match OutcomeComment::try_from(&validate_data.element) {
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
/// `OutcomeComment`s can only be updated by the original commenter and the Outcome must exist.
/// `creator_agent_pub_key` should not change from the original value
pub fn validate_update_entry_outcome_comment(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match OutcomeComment::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // creator_agent_pub_key must match header author
                // and then it will also be validated that the header
                // author is the same as the original author
                match validate_value_matches_create_author(
                    &proposed_entry.creator_agent_pub_key.into(),
                    &validate_data,
                ) {
                    ValidateCallbackResult::Valid => {
                        // go a little more complicated here
                        // -> check the original header and make sure that
                        // this header author matches that original author
                        if let Header::Update(header) = validate_data.element.header() {
                            let original_outcome_comment =
                                must_get_header_and_entry::<OutcomeComment>(
                                    header.original_header_address.clone(),
                                )?;
                            // the final return value
                            // if this passes, all have passed

                            // here we are checking to make sure that
                            // only original author can make this update
                            validate_value_matches_original_author_for_edit(
                                &header.author,
                                &original_outcome_comment.creator_agent_pub_key.into(),
                            )
                        } else {
                            // Holochain passed the wrong header!
                            #[allow(unreachable_code)]
                            return unreachable!();
                        }
                    }
                    validate_callback_result => validate_callback_result,
                }
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_outcome_comment(
    _: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
