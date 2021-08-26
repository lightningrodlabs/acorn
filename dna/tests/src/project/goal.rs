#[cfg(test)]
pub mod tests {
  use projects::project::error::Error;
  use projects::project::fixtures::fixtures::{GoalFixturator, WrappedAgentPubKeyFixturator};
  use ::fixt::prelude::*;
  use hdk_crud::WrappedAgentPubKey;
  use hdk::prelude::*;
  use holochain_types::prelude::ElementFixturator;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_create_entry_goal() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut goal = fixt!(Goal);
    // set is_imported to false so that we don't skip
    // important validation
    goal.is_imported = false;

    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_goal(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with a random (not the agent committing)
    // user_hash it will fail
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    goal.user_hash = random_wrapped_agent_pub_key.clone();
    goal.user_edit_hash = None;
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_goal(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );

    // with the right user_hash for the author
    // but with a Some value for user_edit_hash it should
    // fail since we are doing a create

    // make the user_hash valid by making it equal the
    // AgentPubKey of the agent committing
    goal.user_hash = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    // make the user_edit_hash value bad by filling it with anything
    // even the author's key during create action
    goal.user_edit_hash = Some(random_wrapped_agent_pub_key.clone());
    // update the goal value in the validate_data
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_goal(validate_data.clone()),
      Error::SomeNotNoneDuringCreate.into(),
    );

    // SUCCESS case
    // the element exists and deserializes
    // user_hash refers to the agent committing
    // user_edit_hash is None
    // -> good to go

    goal.user_edit_hash = None;
    // update the goal value in the validate_data
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_create_entry_goal(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_update_entry_goal() {
    let mut validate_data = fixt!(ValidateData);
    let update_header = fixt!(Update);
    let mut goal = fixt!(Goal);

    *validate_data.element.as_header_mut() = Header::Update(update_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with a
    // user_edit_hash None it will fail
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    goal.user_hash = random_wrapped_agent_pub_key.clone();
    goal.user_edit_hash = None;
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());
    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Error::NoneNotSomeDuringEdit.into(),
    );

    // with a random user_edit_hash (not the author agent)
    // it will fail
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    // make the user_edit_hash value bad by filling it with a random author
    goal.user_edit_hash = Some(random_wrapped_agent_pub_key.clone());
    // update the goal value in the validate_data
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());
    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Error::CorruptEditAgentPubKeyReference.into(),
    );

    // with a valid user_edit_hash, we move on to the issue
    // of the `user_hash`. Is it equal to the original author?
    // to know this, we need to resolve that dependency
    goal.user_edit_hash = Some(WrappedAgentPubKey::new(
      update_header.author.as_hash().clone(),
    )); 
    // update the goal value in the validate_data
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original goal, via its header
    // return Ok(None) for now, as if it can't be found
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(vec![GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![None]));

    set_hdk(mock_hdk);

    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        update_header.original_header_address.clone().into()
      ])),
    );

    // now assuming it can be found, we have the question of the header
    // of the original, which we will be checking the author against
    // in the case where it's a different original author, FAIL
    // suggests inappropriate data tampering

    let original_goal = fixt!(Goal);
    let mut original_goal_element = fixt!(Element);
    *original_goal_element.as_entry_mut() =
      ElementEntry::Present(original_goal.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original goal, via its header
    // return a result, as if it can be found
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(vec![GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![Some(original_goal_element.clone())]));

    set_hdk(mock_hdk);

    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Ok(Error::TamperCreateAgentPubKeyReference.into()),
    );

    // SUCCESS case
    // the element exists and deserializes
    // user_edit_hash is Some(the author)
    // original_header_address exists, and the value
    // `user_hash` of the original Goal
    // is equal to the new `user_hash` value
    // -> good to go
    // we should see that the ValidateCallbackResult
    // is finally valid

    // set the user_hash on the goal equal to the original goals user_hash property
    goal.user_hash = original_goal.user_hash.clone();
    *validate_data.element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original goal, via its header
    // return a result, as if it can be found
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(vec![GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![Some(original_goal_element.clone())]));

    set_hdk(mock_hdk);

    assert_eq!(
      super::validate_update_entry_goal(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_delete_entry_goal() {
    assert_eq!(
      super::validate_delete_entry_goal(fixt!(ValidateData)),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
