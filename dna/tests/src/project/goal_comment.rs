#[cfg(test)]
pub mod tests {
    use crate::project::fixtures::fixtures::{
        GoalCommentFixturator, WrappedAgentPubKeyFixturator, WrappedHeaderHashFixturator,
    };
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use hdk_crud::WrappedHeaderHash;
    use holochain_types::prelude::option_entry_hashed;
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
            Error::DeserializationFailed.into(),
        );

        let goal_signed_header_hashed = fixt!(SignedHeaderHashed);
        let goal_wrapped_header_hash =
            WrappedHeaderHash::new(goal_signed_header_hashed.as_hash().clone());
        goal_comment.goal_address = goal_wrapped_header_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_comment.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // now make it as if there is a Goal at the goal_address
        // so that we pass the dependency validation

        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                goal_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(goal_signed_header_hashed.clone()));
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

        // it is as if there is a header for a Goal at the goal_address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                goal_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(goal_signed_header_hashed));

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
            Error::DeserializationFailed.into(),
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

        // make it now resolve the original GoalComment
        // but now be invalid according to the original GoalComment
        // being authored by a different author than this update

        let bad_original_goal_comment = fixt!(GoalComment);
        // but due to being random, it will have a different author
        // than our Update header
        let mut bad_original_goal_comment_element = fixt!(Element);
        let bad_create_header = fixt!(Create);
        *bad_original_goal_comment_element.as_header_mut() = Header::Create(bad_create_header.clone());
        *bad_original_goal_comment_element.as_entry_mut() =
            ElementEntry::Present(bad_original_goal_comment.clone().try_into().unwrap());
        let bad_original_entry_hash = bad_original_goal_comment_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a GoalComment at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address.clone(),
            )))
            .times(1)
            .return_const(Ok(bad_original_goal_comment_element
                .signed_header()
                .clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                bad_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                bad_original_goal_comment_element.entry().clone(),
            )
            .unwrap()));
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
        let mut good_original_goal_comment = fixt!(GoalComment);
        let mut good_original_goal_comment_element = fixt!(Element);
        let good_create_header = fixt!(Create);
        *good_original_goal_comment_element.as_header_mut() =
            Header::Create(good_create_header.clone());
        // make the author equal to the current `user_hash` value
        // on the Goal in validate_data
        good_original_goal_comment.agent_address =
            WrappedAgentPubKey::new(update_header.author.as_hash().clone());
        *good_original_goal_comment_element.as_entry_mut() =
            ElementEntry::Present(good_original_goal_comment.clone().try_into().unwrap());

        let good_original_entry_hash = good_original_goal_comment_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a GoalComment at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address,
            )))
            .times(1)
            .return_const(Ok(good_original_goal_comment_element
                .signed_header()
                .clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                good_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                good_original_goal_comment_element.entry().clone(),
            )
            .unwrap()));
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
