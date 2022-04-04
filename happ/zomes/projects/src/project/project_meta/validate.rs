use crate::project::{
    error::Error,
    project_meta::crud::ProjectMeta,
    validate::{must_get_header_and_entry, validate_value_matches_create_author},
};
use hdk::prelude::*;

#[hdk_extern]
/// Creates allowed if `creator_agent_pub_key` matches the agent committing
pub fn validate_create_entry_project_meta(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match ProjectMeta::try_from(&validate_data.element) {
            Ok(proposed_entry) => {
                // `address` must match header author
                validate_value_matches_create_author(
                    &proposed_entry.creator_agent_pub_key.into(),
                    &validate_data,
                )
            }
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Updates allowed by anyone, but `creator_agent_pub_key`, `created_at`, and `passphrase` cannot be changed
pub fn validate_update_entry_project_meta(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        // element must have an entry that must deserialize correctly
        match ProjectMeta::try_from(&validate_data.element) {
            Ok(project_meta) => match validate_data.element.header() {
                Header::Update(header) => {
                    let original_project_meta = must_get_header_and_entry::<ProjectMeta>(
                        header.original_header_address.clone(),
                    )?;
                    if project_meta.creator_agent_pub_key == original_project_meta.creator_agent_pub_key
                        && project_meta.created_at == original_project_meta.created_at
                        && project_meta.passphrase == original_project_meta.passphrase
                    {
                        ValidateCallbackResult::Valid
                    } else {
                        Error::ProjectMetaEditableFields.into()
                    }
                }
                _ => {
                    // Holochain passed the wrong header!
                    #[allow(unreachable_code)]
                    return unreachable!();
                }
            },
            Err(_e) => Error::DeserializationFailed.into(),
        },
    )
}

#[hdk_extern]
/// Deletes aren't allowed
pub fn validate_delete_entry_project_meta(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(Error::DeleteAttempted.into())
}
