use crate::project::goal::crud::Goal;
use crate::project::{error::Error, validate::confirm_resolved_dependency};
use crate::project::{
  goal_member::crud::GoalMember, validate::validate_value_matches_create_author,
};
use hdk::prelude::*;

#[hdk_extern]
fn validate_create_entry_goal_member(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match GoalMember::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // parent goal at goal_address must be determined to exist
        match confirm_resolved_dependency::<Goal>(proposed_entry.goal_address.0.into())? {
          ValidateCallbackResult::Valid => {
            // an imported entry can have another listed as author, and an edit history
            if proposed_entry.is_imported {
              ValidateCallbackResult::Valid
            } else {
              // creator_address must match header author
              validate_value_matches_create_author(&proposed_entry.user_edit_hash.0, &validate_data)
            }
          }
          validate_callback_result => validate_callback_result,
        }
      }
      Err(e) => ValidateCallbackResult::Invalid(e.to_string()),
    },
  )
}

#[hdk_extern]
/// Updates are not allowed
fn validate_update_entry_goal_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
fn validate_delete_entry_goal_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

#[cfg(test)]
pub mod tests {
  use crate::project::error::Error;
  use crate::project::fixtures::fixtures::{
    GoalFixturator, GoalMemberFixturator, WrappedAgentPubKeyFixturator, WrappedHeaderHashFixturator,
  };
  use ::fixt::prelude::*;
  use hdk_crud::WrappedAgentPubKey;
  use hdk::prelude::*;
  use holochain_types::prelude::ElementFixturator;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_update_entry_goal_member() {
    assert_eq!(
      super::validate_update_entry_goal_member(fixt!(ValidateData)),
      Error::UpdateAttempted.into(),
    );
  }

  #[test]
  fn test_validate_delete_entry_goal_member() {
    assert_eq!(
      super::validate_delete_entry_goal_member(fixt!(ValidateData)),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_create_entry_goal_member() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut goal_member = fixt!(GoalMember);
    // set is_imported to false so that we don't skip
    // important validation
    goal_member.is_imported = false;

    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_goal_member(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    // make it pass EntryMissing by adding the Element
    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    goal_member.goal_address = goal_wrapped_header_hash.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_member.clone().try_into().unwrap());

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
      super::validate_create_entry_goal_member(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_wrapped_header_hash.clone().0.into()
      ])),
    );

    // now make it pass UnresolvedDependencies
    // by making it as if there is a Goal at the parent_address
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

    // with an entry with a random
    // user_edit_hash it will fail (not the agent committing)
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    goal_member.user_edit_hash = random_wrapped_agent_pub_key.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_member.clone().try_into().unwrap());

    assert_eq!(
      super::validate_create_entry_goal_member(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );
    
    // SUCCESS case
    // the element exists
    // the parent goal is found/exists
    // is_imported is false and creator_address refers to the agent committing (or is_imported = true)
    // -> good to go

    // make it as if there is a Goal at the parent_address
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

    // make the user_edit_hash valid by making it equal the
    // AgentPubKey of the agent committing,
    // but it will still be missing the goal dependency so it will
    // return UnresolvedDependencies
    goal_member.user_edit_hash = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_member.clone().try_into().unwrap());

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_create_entry_goal_member(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
