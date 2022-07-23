use crate::project::error::Error;
use crate::project::tag::crud::Tag;
use hdk::prelude::*;

pub fn validate_tag(validate_data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    let proposed_tag = match Tag::try_from(&validate_data.element) {
        Ok(tag) => tag,
        Err(_e) => {
            // early exit the whole function
            return Ok(Error::DeserializationFailed.into());
        }
    };

    if !(proposed_tag.background_color.len() == 4 || proposed_tag.background_color.len() == 7)
        || !proposed_tag.background_color.starts_with("#")
    {
        return Ok(Error::BadTagColor.into());
    }

    if proposed_tag.text.len() == 0 {
        return Ok(Error::BadTagString.into());
    }
    Ok(ValidateCallbackResult::Valid)
}

#[hdk_extern]
/// New connections cannot be self-referential and both the parent and child outcome must exist
pub fn validate_create_entry_tag(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    validate_tag(validate_data)
}

#[hdk_extern]
/// Updates are allowed by anyone
pub fn validate_update_entry_tag(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    validate_tag(validate_data)
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_tag(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
