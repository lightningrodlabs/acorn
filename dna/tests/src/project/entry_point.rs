#[cfg(test)]
pub mod tests {
  use projects::project::error::Error;
  use projects::project::fixtures::fixtures::{
    EntryPointFixturator, GoalFixturator, WrappedAgentPubKeyFixturator, WrappedHeaderHashFixturator,
  };
  use ::fixt::prelude::*;
  use hdk::prelude::*;
  use hdk_crud::WrappedAgentPubKey;
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
    // set is_imported to false so that we don't skip
    // important validation
    entry_point.is_imported = false;

    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // now make it pass EntryMissing by adding an ElementEntry::Present
    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    entry_point.goal_address = goal_wrapped_header_hash.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(entry_point.clone().try_into().unwrap());

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    // it will be missing the goal dependency so it will
    // return UnresolvedDependencies

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the parent goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(vec![GetInput::new(
        goal_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![None]));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
    // equal to the Hash of the parent Goal address
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_wrapped_header_hash.clone().0.into()
      ])),
    );

    // now make it valid by making it
    // as if there is a Goal at the parent_address
    let goal = fixt!(Goal);
    let mut goal_element = fixt!(Element);
    *goal_element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the goal_address
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(vec![GetInput::new(
        goal_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![Some(goal_element.clone())]));

    set_hdk(mock_hdk);

    // with an entry with a random (not the agent committing)
    // creator_address it will fail
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    entry_point.creator_address = random_wrapped_agent_pub_key.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(entry_point.clone().try_into().unwrap());

    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
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
      .with(mockall::predicate::eq(vec![GetInput::new(
        goal_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )]))
      .times(1)
      .return_const(Ok(vec![Some(goal_element.clone())]));

    set_hdk(mock_hdk);

    // make the creator_address valid by making it equal the
    // AgentPubKey of the agent committing,
    entry_point.creator_address = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(entry_point.clone().try_into().unwrap());

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_create_entry_entry_point(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
