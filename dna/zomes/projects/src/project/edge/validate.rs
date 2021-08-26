use crate::project::edge::crud::Edge;
use crate::project::error::Error;
use crate::project::goal::crud::Goal;
use crate::project::validate::confirm_resolved_dependency;
use hdk::prelude::*;

#[hdk_extern]
pub fn validate_create_entry_edge(validate_data: ValidateData) -> ExternResult<ValidateCallbackResult> {
  let proposed_edge = match Edge::try_from(&validate_data.element) {
    Ok(edge) => edge,
    Err(_e) => {
      // early exit the whole function
      return Ok(Error::EntryMissing.into())
    },
  };

  // avoid edges to/from self
  // parent and child can't be the same
  if proposed_edge.child_address == proposed_edge.parent_address {
    return Ok(Error::IdenticalParentChild.into());
  }

  // parent goal, and child goal, must be determined to exist to pass validation
  if let Header::Create(_) = validate_data.element.header() {
    let parent_res = confirm_resolved_dependency::<Goal>(proposed_edge.parent_address.0.into())?;
    let child_res = confirm_resolved_dependency::<Goal>(proposed_edge.child_address.0.into())?;
    match (parent_res, child_res) {
      (ValidateCallbackResult::Valid, ValidateCallbackResult::Valid) => {
        Ok(ValidateCallbackResult::Valid)
      }
      (
        ValidateCallbackResult::UnresolvedDependencies(parent_dep),
        ValidateCallbackResult::UnresolvedDependencies(child_dep),
      ) => Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        parent_dep.first().unwrap().to_owned(),
        child_dep.first().unwrap().to_owned(),
      ])),
      (ValidateCallbackResult::UnresolvedDependencies(parent_dep), _) => {
        Ok(ValidateCallbackResult::UnresolvedDependencies(parent_dep))
      }
      (_, ValidateCallbackResult::UnresolvedDependencies(child_dep)) => {
        Ok(ValidateCallbackResult::UnresolvedDependencies(child_dep))
      }
      validate_callback_results => {
        if let ValidateCallbackResult::Invalid(e) = validate_callback_results.0 {
          // parent was invalid
          Ok(ValidateCallbackResult::Invalid(e))
        } else {
          // child was invalid
          Ok(validate_callback_results.1)
        }
      }
    }
  }
  // Holochain sent the wrong header!
  else {
    unreachable!();
  }
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
