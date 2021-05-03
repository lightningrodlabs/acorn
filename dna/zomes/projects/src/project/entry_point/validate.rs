use crate::project::goal::crud::Goal;
use crate::project::{
  entry_point::crud::EntryPoint, validate::validate_value_matches_create_author,
};
use crate::project::{error::Error, validate::confirm_resolved_dependency};
use hdk::prelude::*;

#[hdk_extern]
fn validate_create_entry_entry_point(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match EntryPoint::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // creator_address must match header author
        match validate_value_matches_create_author(&proposed_entry.creator_address.0, &validate_data)
        {
          ValidateCallbackResult::Valid => {
            // parent goal at goal_address must be determined to exist
            confirm_resolved_dependency::<Goal>(proposed_entry.goal_address.0.into())?
          }
          validate_callback_result => validate_callback_result,
        }
      }
      Err(e) => e.into(), // ValidateCallbackResult
    },
  )
}

#[hdk_extern]
/// Updates are not allowed
fn validate_update_entry_entry_point(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
fn validate_delete_entry_entry_point(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

#[cfg(test)]
pub mod tests {
  use crate::project::error::Error;
  use crate::project::fixtures::fixtures::{
    EntryPointFixturator, GoalFixturator, WrappedAgentPubKeyFixturator, WrappedHeaderHashFixturator,
  };
  use ::fixt::prelude::*;
  use dna_help::WrappedAgentPubKey;
  use hdk::prelude::*;
  use holochain_types::prelude::ElementFixturator;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_update_entry_entry_point() {
    assert_eq!(
      super::validate_update_entry_entry_point(fixt!(ValidateData)),
      Error::UpdateAttempted.into(),
    );
  }

  #[test]
  fn test_validate_delete_entry_entry_point() {
    assert_eq!(
      super::validate_delete_entry_entry_point(fixt!(ValidateData)),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_create_entry_entry_point() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut entry_point = fixt!(EntryPoint);

    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with a random
    // creator_address it will fail (not the agent committing)
    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    entry_point.goal_address = goal_wrapped_header_hash.clone();
    entry_point.creator_address = random_wrapped_agent_pub_key.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(entry_point.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );

    // make the creator_address valid by making it equal the
    // AgentPubKey of the agent committing,
    // but it will still be missing the goal dependency so it will
    // return UnresolvedDependencies
    entry_point.creator_address = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(entry_point.clone().try_into().unwrap());

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the parent goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(None));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
    // equal to the Hash of the parent Goal address
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_wrapped_header_hash.clone().0.into()
      ])),
    );

    // SUCCESS case
    // the element exists
    // creator_address refers to the agent committing
    // the parent goal is found/exists
    // -> good to go

    // now it is as if there is a Goal at the parent_address
    let goal = fixt!(Goal);
    let mut goal_element = fixt!(Element);
    *goal_element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the goal_address
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_element.clone())));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
