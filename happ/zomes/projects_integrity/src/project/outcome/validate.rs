use crate::project::{
    error::Error,
    outcome::crud::Outcome,
    validate::{
        must_get_header_and_entry, validate_value_is_none, validate_value_is_some,
        validate_value_matches_create_author, validate_value_matches_edit_author,
        validate_value_matches_original_author,
    },
};
use hdk::prelude::*;
use holo_hash::AgentPubKeyB64;

#[hdk_extern]
/// Creates only allowed if `creator_agent_pub_key` of the Outcome entry matches the agent
/// creating the entry and if `editor_agent_pub_key` is not set, unless the Outcome is imported
pub fn validate_create_entry_outcome(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match Outcome::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // an imported entry can have another listed as author, and an edit history
                if proposed_entry.is_imported {
                    ValidateCallbackResult::Valid
                } else {
                    // creator_agent_pub_key must match header author
                    match validate_value_matches_create_author(
                        &proposed_entry.creator_agent_pub_key.into(),
                        &validate_data,
                    ) {
                        ValidateCallbackResult::Valid => {
                            // editor_agent_pub_key must not be Some during create
                            validate_value_is_none::<AgentPubKeyB64>(&proposed_entry.editor_agent_pub_key)
                        }
                        validate_callback_result => validate_callback_result,
                    }
                }
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Updates only allowed if `editor_agent_pub_key` of the updated Outcome entry matches the
/// agent publishing the update, `creator_agent_pub_key` cannot change from the original value
pub fn validate_update_entry_outcome(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match Outcome::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // editor_agent_pub_key must be Some during edit
                match validate_value_is_some::<AgentPubKeyB64>(&proposed_entry.editor_agent_pub_key) {
                    ValidateCallbackResult::Valid => {
                        // editor_agent_pub_key must match header author
                        match validate_value_matches_edit_author(
                            // can safely unwrap because we just checked
                            // the value is Some
                            &proposed_entry.editor_agent_pub_key.unwrap().into(),
                            &validate_data,
                        ) {
                            ValidateCallbackResult::Valid => {
                                // go a little more complicated here
                                // -> check the original header and make sure that
                                // `creator_agent_pub_key` still matches that original author
                                if let Header::Update(header) = validate_data.element.header() {
                                    let original_action_hash =
                                        header.original_header_address.clone();
                                    let original_outcome =
                                        must_get_header_and_entry::<Outcome>(original_action_hash)?;
                                    // the final return value
                                    // if this passes, all have passed

                                    // here we are checking to make sure that
                                    // this user is not suggesting that someone other than
                                    // the original author of the original outcome WAS the original
                                    validate_value_matches_original_author(
                                        &proposed_entry.creator_agent_pub_key.into(),
                                        &original_outcome.creator_agent_pub_key.into(),
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
                    validate_callback_result => validate_callback_result,
                }
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_outcome(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
