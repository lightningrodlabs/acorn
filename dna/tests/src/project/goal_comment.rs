#[cfg(test)]
pub mod tests {
    use crate::project::fixtures::fixtures::{
        GoalCommentFixturator, GoalFixturator, WrappedAgentPubKeyFixturator,
        WrappedHeaderHashFixturator,
    };
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::goal_comment::validate::*;

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
            validate_create_entry_goal_comment(validate_data.clone()),
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
            validate_create_entry_goal_comment(validate_data.clone()),
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
            .with(mockall::predicate::eq(vec![GetInput::new(
                goal_wrapped_header_hash.clone().0.into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(goal_element.clone())]));

        set_hdk(mock_hdk);

        // with an entry with a random
        // agent_address it will fail (not the agent committing)
        let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
        goal_comment.agent_address = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_comment.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_goal_comment(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent goal is found/exists
        // agent_address refers to the agent committing
        // -> good to go

        // make the agent_address valid by making it equal the
        // AgentPubKey of the agent committing
        goal_comment.agent_address =
            WrappedAgentPubKey::new(create_header.author.as_hash().clone());
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
            .with(mockall::predicate::eq(vec![GetInput::new(
                goal_wrapped_header_hash.clone().0.into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(goal_element.clone())]));

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_goal_comment(validate_data.clone()),
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
            validate_update_entry_goal_comment(validate_data.clone()),
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
            validate_update_entry_goal_comment(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // make the agent_address valid by making it equal the
        // AgentPubKey of the agent committing,
        // but it will still be missing the original GoalComment
        // dependency so it will
        // return UnresolvedDependencies
        goal_comment.agent_address =
            WrappedAgentPubKey::new(update_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_comment.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original GoalComment
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            // act as if not present / not found
            .return_const(Ok(vec![None]));

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
        // equal to the Hash of the original_header_address of the Update
        assert_eq!(
            validate_update_entry_goal_comment(validate_data.clone()),
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
        let mut original_goal_comment_element = fixt!(Element);
        *original_goal_comment_element.as_entry_mut() =
            ElementEntry::Present(original_goal_comment.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original_header_address
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(original_goal_comment_element.clone())]));

        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_goal_comment(validate_data.clone()),
            Error::UpdateOnNonAuthoredOriginal.into(),
        );

        // SUCCESS case
        // the element exists
        // agent_address refers to the agent committing
        // the original GoalComment header and entry exist
        // and the author of the update matches the original author
        // -> good to go
        let mut original_goal_comment = fixt!(GoalComment);
        let mut original_goal_comment_element = fixt!(Element);
        // make the author equal to the current `user_hash` value
        // on the Goal in validate_data
        original_goal_comment.agent_address =
            WrappedAgentPubKey::new(update_header.author.as_hash().clone());
        *original_goal_comment_element.as_entry_mut() =
            ElementEntry::Present(original_goal_comment.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original_header_address
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(original_goal_comment_element.clone())]));

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_update_entry_goal_comment(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_goal_comment() {
        let mut validate_data = fixt!(ValidateData);
        let delete_header = fixt!(Delete);
        *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
        assert_eq!(
            validate_delete_entry_goal_comment(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
