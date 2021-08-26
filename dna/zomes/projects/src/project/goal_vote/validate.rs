use crate::project::goal::crud::Goal;
use crate::project::validate::confirm_resolved_dependency;
use crate::project::{
  goal_vote::crud::GoalVote,
  error::Error,
  validate::{
    validate_value_matches_create_author, validate_value_matches_original_author_for_edit,
  },
};
use hdk::prelude::*;
use hdk_crud::{resolve_dependency, ResolvedDependency};

#[hdk_extern]
pub fn validate_create_entry_goal_vote(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match GoalVote::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // parent goal at goal_address must be determined to exist
        match confirm_resolved_dependency::<Goal>(proposed_entry.goal_address.0.into())? {
          ValidateCallbackResult::Valid => {
            // an imported entry can have another listed as author, and an edit history
            if proposed_entry.is_imported {
              ValidateCallbackResult::Valid
            } else {
              // agent_address must match header author
              validate_value_matches_create_author(&proposed_entry.agent_address.0, &validate_data)
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
pub fn validate_update_entry_goal_vote(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match GoalVote::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // agent_address must match header author
        // and then it will also be validated that the header
        // author is the same as the original author
        match validate_value_matches_create_author(&proposed_entry.agent_address.0, &validate_data)
        {
          ValidateCallbackResult::Valid => {
            // go a little more complicated here
            // -> check the original header and make sure that
            // this header author matches that original author
            if let Header::Update(header) = validate_data.element.header() {
              match resolve_dependency::<GoalVote>(header.original_header_address.clone().into())? {
                Ok(ResolvedDependency(_el, goal_vote)) => {
                  // the final return value
                  // if this passes, all have passed

                  // here we are checking to make sure that
                  // only original author can make this update
                  validate_value_matches_original_author_for_edit(
                    &header.author,
                    &goal_vote.agent_address.0,
                  )
                }
                // the unresolved dependency case
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
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
/// Deletes are allowed only by original author
pub fn validate_delete_entry_goal_vote(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
