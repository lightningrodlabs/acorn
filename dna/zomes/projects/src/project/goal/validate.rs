use crate::project::{
  goal::crud::Goal,
  error::Error,
  validate::{
    validate_value_is_none, validate_value_is_some, validate_value_matches_create_author,
    validate_value_matches_edit_author, validate_value_matches_original_author,
  },
};
use hdk_crud::{resolve_dependency, ResolvedDependency, WrappedAgentPubKey};
use hdk::prelude::*;

#[hdk_extern]
pub fn validate_create_entry_goal(validate_data: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match Goal::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // an imported entry can have another listed as author, and an edit history
        if proposed_entry.is_imported {
          ValidateCallbackResult::Valid
        } else {
          // creator_address must match header author
          match validate_value_matches_create_author(&proposed_entry.user_hash.0, &validate_data) {
            ValidateCallbackResult::Valid => {
              // user_edit_hash must not be Some during create
              validate_value_is_none::<WrappedAgentPubKey>(&proposed_entry.user_edit_hash)
            }
            validate_callback_result => validate_callback_result,
          }
        }
      }
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
pub fn validate_update_entry_goal(validate_data: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match Goal::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // user_edit_hash must be Some during edit
        match validate_value_is_some::<WrappedAgentPubKey>(&proposed_entry.user_edit_hash) {
          ValidateCallbackResult::Valid => {
            // user_edit_hash must match header author
            match validate_value_matches_edit_author(
              // can safely unwrap because we just checked
              // the value is Some
              &proposed_entry.user_edit_hash.unwrap().0,
              &validate_data,
            ) {
              ValidateCallbackResult::Valid => {
                // go a little more complicated here
                // -> check the original header and make sure that
                // `user_hash` still matches that original author
                if let Header::Update(header) = validate_data.element.header() {
                  match resolve_dependency::<Goal>(header.original_header_address.clone().into())? {
                    Ok(ResolvedDependency(_el, goal)) => {
                      // the final return value
                      // if this passes, all have passed

                      // here we are checking to make sure that
                      // this user is not suggesting that someone other than
                      // the original author of the original goal WAS the original
                      validate_value_matches_original_author(&proposed_entry.user_hash.0, &goal.user_hash.0)
                    }
                    // the unresolved dependency case and invalid case
                    Err(validate_callback_result) => validate_callback_result,
                  }
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
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
/// Deletes are allowed by anyone
pub fn validate_delete_entry_goal(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
