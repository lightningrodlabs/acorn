use crate::project::goal::crud::Goal;
use crate::project::validate::confirm_resolved_dependency;
use crate::project::{
  goal_comment::crud::GoalComment,
  validate::{
    validate_value_matches_create_author, validate_value_matches_original_author_for_edit,
  },
};
use hdk::prelude::*;
use hdk_crud::{resolve_dependency, ResolvedDependency};

#[hdk_extern]
fn validate_create_entry_goal_comment(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match GoalComment::try_from(&validate_data.element) {
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
      Err(e) => e.into(), // ValidateCallbackResult
    },
  )
}

#[hdk_extern]
fn validate_update_entry_goal_comment(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match GoalComment::try_from(&validate_data.element) {
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
              match resolve_dependency::<GoalComment>(
                header.original_header_address.clone().into(),
              )? {
                Ok(ResolvedDependency(el, _)) => {
                  // the final return value
                  // if this passes, all have passed

                  // here we are checking to make sure that
                  // only original author can make this update
                  validate_value_matches_original_author_for_edit(&header.author, &el)
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
      Err(e) => e.into(), // ValidateCallbackResult
    },
  )
}

#[hdk_extern]
/// Deletes are allowed by anyone
fn validate_delete_entry_goal_comment(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}

#[cfg(test)]
pub mod tests {
  use crate::project::error::Error;
  use crate::project::fixtures::fixtures::{GoalCommentFixturator, GoalFixturator};
  use ::fixt::prelude::*;
  use hdk::prelude::*;
  use hdk_crud::{
    fixtures::{WrappedAgentPubKeyFixturator, WrappedHeaderHashFixturator},
    WrappedAgentPubKey,
  };
  use holochain_types::prelude::ElementFixturator;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_create_entry_goal_comment() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut goal_comment = fixt!(GoalComment);
    // set is_imported to false so that we don't skip
    // important validation
    goal_comment.is_imported = false;

    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_goal_comment(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    goal_comment.goal_address = goal_wrapped_header_hash.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_comment.clone().try_into().unwrap());

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
      super::validate_create_entry_goal_comment(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        goal_wrapped_header_hash.clone().0.into()
      ])),
    );

    // now make it as if there is a Goal at the parent_address
    // so that we pass the dependency validation
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
    // agent_address it will fail (not the agent committing)
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    goal_comment.agent_address = random_wrapped_agent_pub_key.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_comment.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_goal_comment(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );

    // SUCCESS case
    // the element exists
    // the parent goal is found/exists
    // agent_address refers to the agent committing
    // -> good to go

    // make the agent_address valid by making it equal the
    // AgentPubKey of the agent committing
    goal_comment.agent_address = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_comment.clone().try_into().unwrap());

    // it is as if there is a Goal at the parent_address
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
      super::validate_create_entry_goal_comment(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_update_entry_goal_comment() {
    let mut validate_data = fixt!(ValidateData);
    let update_header = fixt!(Update);
    let mut goal_comment = fixt!(GoalComment);
    *validate_data.element.as_header_mut() = Header::Update(update_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_update_entry_goal_comment(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with a random
    // agent_address it will fail (not the agent committing)
    let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
    let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
    goal_comment.goal_address = goal_wrapped_header_hash.clone();
    goal_comment.agent_address = random_wrapped_agent_pub_key.clone();
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_comment.clone().try_into().unwrap());
    assert_eq!(
      super::validate_update_entry_goal_comment(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );

    // make the agent_address valid by making it equal the
    // AgentPubKey of the agent committing,
    // but it will still be missing the original GoalComment
    // dependency so it will
    // return UnresolvedDependencies
    goal_comment.agent_address = WrappedAgentPubKey::new(update_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(goal_comment.clone().try_into().unwrap());

    // now, since validation is dependent on other entries, we begin
    // to have to mock `get` calls to the HDK

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original GoalComment
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )))
      .times(1)
      // act as if not present / not found
      .return_const(Ok(None));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
    // equal to the Hash of the original_header_address of the Update
    assert_eq!(
      super::validate_update_entry_goal_comment(validate_data.clone()),
      Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
        update_header.original_header_address.clone().into()
      ])),
    );

    // make it now resolve the original GoalComment
    // but now be invalid according to the original GoalComment
    // being authored by a different author than this update

    // now it is as if there is a GoalComment at the original address
    let original_goal_comment = fixt!(GoalComment);
    // but due to being random, it will have a different author
    // than our Update header
    let mut goal_comment_element = fixt!(Element);
    *goal_comment_element.as_entry_mut() =
      ElementEntry::Present(original_goal_comment.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original_header_address
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_comment_element.clone())));

    set_hdk(mock_hdk);

    assert_eq!(
      super::validate_update_entry_goal_comment(validate_data.clone()),
      Error::UpdateOnNonAuthoredOriginal.into(),
    );

    // SUCCESS case
    // the element exists
    // agent_address refers to the agent committing
    // the original GoalComment header and entry exist
    // and the author of the update matches the original author
    // -> good to go
    let original_goal_comment = fixt!(GoalComment);
    let mut goal_comment_element = fixt!(Element);
    let mut original_create_header = fixt!(Create);
    // make the authors equal
    original_create_header = Create {
      author: update_header.author.as_hash().clone(),
      ..original_create_header
    };
    *goal_comment_element.as_header_mut() = Header::Create(original_create_header.clone());
    *goal_comment_element.as_entry_mut() =
      ElementEntry::Present(original_goal_comment.clone().try_into().unwrap());

    let mut mock_hdk = MockHdkT::new();
    // the resolve_dependencies `get` call of the original_header_address
    mock_hdk
      .expect_get()
      .with(mockall::predicate::eq(GetInput::new(
        update_header.original_header_address.clone().into(),
        GetOptions::content(),
      )))
      .times(1)
      .return_const(Ok(Some(goal_comment_element.clone())));

    set_hdk(mock_hdk);

    // we should see that the ValidateCallbackResult
    // is finally valid
    assert_eq!(
      super::validate_update_entry_goal_comment(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_delete_entry_goal_comment() {
    let mut validate_data = fixt!(ValidateData);
    let delete_header = fixt!(Delete);
    *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
    assert_eq!(
      super::validate_delete_entry_goal_comment(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }
}
