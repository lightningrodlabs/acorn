use crate::project::validate::must_get_header_and_entry;
use crate::project::{
    error::Error,
    outcome_vote::crud::OutcomeVote,
    validate::{
        validate_value_matches_create_author, validate_value_matches_original_author_for_edit,
    },
};
use hdk::prelude::*;

#[hdk_extern]
/// `OutcomeVote`s can only be created if the Outcome exists and if `creator_agent_pub_key` of the
/// `OutcomeVote` matches the agent authoring the entry, unless the `OutcomeVote` is imported
pub fn validate_create_entry_outcome_vote(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match OutcomeVote::try_from(&validate_data.element) {
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
/// Updates allowed if the original `OutcomeVote` exists and only by the original author
/// `creator_agent_pub_key` cannot change from the original address
pub fn validate_update_entry_outcome_vote(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match OutcomeVote::try_from(&validate_data.element) {
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
                            let original_outcome_vote = must_get_header_and_entry::<OutcomeVote>(
                                header.original_header_address.clone(),
                            )?;
                            // the final return value
                            // if this passes, all have passed.
                            // here we are checking to make sure that
                            // only original author can make this update
                            validate_value_matches_original_author_for_edit(
                                &header.author,
                                &original_outcome_vote.creator_agent_pub_key.into(),
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
/// Deletes are allowed only by original author
pub fn validate_delete_entry_outcome_vote(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
