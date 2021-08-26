use crate::project::edge::crud::Edge;
use crate::project::error::Error;
use hdk::prelude::*;

#[hdk_extern]
pub fn validate_create_entry_edge(
    validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
    let proposed_edge = match Edge::try_from(&validate_data.element) {
        Ok(edge) => edge,
        Err(_e) => {
            // early exit the whole function
            return Ok(Error::DeserializationFailed.into());
        }
    };

    // avoid edges to/from self
    // parent and child can't be the same
    if proposed_edge.child_address == proposed_edge.parent_address {
        return Ok(Error::IdenticalParentChild.into());
    }

    // parent goal, and child goal, must be determined to exist to pass validation
    must_get_header(proposed_edge.parent_address.0)?;
    must_get_header(proposed_edge.child_address.0)?;
    Ok(ValidateCallbackResult::Valid)
}

#[hdk_extern]
/// Updates are not allowed
pub fn validate_update_entry_edge(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_edge(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
