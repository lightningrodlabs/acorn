use crate::project::edge::crud::Edge;
use crate::project::error::Error;
use crate::project::goal::crud::Goal;
use crate::project::validate::confirm_resolved_dependency;
use hdk::prelude::*;

#[hdk_extern]
fn validate_create_entry_edge(validate_data: ValidateData) -> ExternResult<ValidateCallbackResult> {
  let proposed_edge = match Edge::try_from(&validate_data.element) {
    Ok(edge) => edge,
    Err(e) => return Ok(ValidateCallbackResult::Invalid(e.to_string())),
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
fn validate_update_entry_edge(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Error::UpdateAttempted.into()
}

#[hdk_extern]
/// Deletes are allowed by anyone
fn validate_delete_entry_edge(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

#[cfg(test)]
pub mod tests {
  use crate::project::error::Error;
  use crate::project::fixtures::fixtures::{
    EdgeFixturator, GoalFixturator, WrappedHeaderHashFixturator,
  };
  use ::fixt::prelude::*;
  use hdk::prelude::*;
  use holochain_types::prelude::ElementFixturator;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_update_entry_edge() {
    assert_eq!(
      super::validate_update_entry_edge(fixt!(ValidateData)),
      Error::UpdateAttempted.into(),
    );
  }

  #[test]
  fn test_validate_delete_entry_edge() {
    assert_eq!(
      super::validate_delete_entry_edge(fixt!(ValidateData)),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_create_entry_edge() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut edge = fixt!(Edge);

    *validate_data.element.as_header_mut() = Header::Create(create_header);

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_edge(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with identical hash for parent_address and child_address validation will fail
    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    edge.parent_address = goal_wrapped_header_hash.clone();
    edge.child_address = goal_wrapped_header_hash.clone();
    *validate_data.element.as_entry_mut() = ElementEntry::Present(edge.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_edge(validate_data.clone()),
      Error::IdenticalParentChild.into(),
    );

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    // we assign different parent and child to pass that level of validation
    let goal_parent_wrapped_header_hash = fixt!(WrappedHeaderHash);
    let goal_child_wrapped_header_hash = fixt!(WrappedHeaderHash);
    edge.parent_address = goal_parent_wrapped_header_hash.clone();
    edge.child_address = goal_child_wrapped_header_hash.clone();
    *validate_data.element.as_entry_mut() = ElementEntry::Present(edge.clone().try_into().unwrap());

    // act as if the parent_address Goal were missing, could not be resolved
    let mut mock_hdk = MockHdkT::new();
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_parent_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(None));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
    // equal to the Hash of the parent Goal address
    assert_eq!(
      super::validate_create_entry_edge(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_parent_wrapped_header_hash.clone().0.into()
      ])),
    );

    // now it is as if there is a Goal at the parent_address, and so only the child_address fails now
    let goal = fixt!(Goal);
    let mut goal_element = fixt!(Element);
    *goal_element.as_entry_mut() = ElementEntry::Present(goal.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the parent goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_parent_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_element.clone())));

    // the resolve_dependencies `get` call of the child goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_child_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(None));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
    // equal to the Hash of the child Goal address
    assert_eq!(
      super::validate_create_entry_edge(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_child_wrapped_header_hash.clone().0.into()
      ])),
    );

    // SUCCESS case
    // the element exists
    // parent_address and child_address are not identical
    // the parent goal is found/exists
    // the child goal is found/exists
    // -> good to go

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the parent goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_parent_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_element.clone())));

    // the resolve_dependencies `get` call of the child goal
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        goal_child_wrapped_header_hash.clone().0.into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_element.clone())));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_create_entry_edge(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
