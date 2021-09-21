#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::{GoalFixturator, WrappedAgentPubKeyFixturator};
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::goal::validate::*;

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
            validate_create_entry_goal(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a random (not the agent committing)
        // user_hash it will fail
        let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
        goal.user_hash = random_wrapped_agent_pub_key.clone();
        goal.user_edit_hash = None;
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_goal(validate_data.clone()),
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
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_goal(validate_data.clone()),
            Error::SomeNotNoneDuringCreate.into(),
        );

        // SUCCESS case
        // the element exists and deserializes
        // user_hash refers to the agent committing
        // user_edit_hash is None
        // -> good to go

        goal.user_edit_hash = None;
        // update the goal value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_goal(validate_data.clone()),
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
            validate_update_entry_goal(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a
        // user_edit_hash None it will fail
        let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
        goal.user_hash = random_wrapped_agent_pub_key.clone();
        goal.user_edit_hash = None;
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_goal(validate_data.clone()),
            Error::NoneNotSomeDuringEdit.into(),
        );

        // with a random user_edit_hash (not the author agent)
        // it will fail
        let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
        // make the user_edit_hash value bad by filling it with a random author
        goal.user_edit_hash = Some(random_wrapped_agent_pub_key.clone());
        // update the goal value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_goal(validate_data.clone()),
            Error::CorruptEditAgentPubKeyReference.into(),
        );

        // with a valid user_edit_hash, we move on to the issue
        // of the `user_hash`. Is it equal to the original author?
        // to know this, we need to resolve that dependency
        goal.user_edit_hash = Some(WrappedAgentPubKey::new(
            update_header.author.as_hash().clone(),
        ));
        // update the goal value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // now assuming it can be found, we have the question of the header
        // of the original, which we will be checking the author against
        // in the case where it's a different original author, FAIL
        // suggests inappropriate data tampering

        let bad_original_goal = fixt!(Goal);
        let mut bad_original_goal_element = fixt!(Element);
        let bad_create_header = fixt!(Create);
        *bad_original_goal_element.as_header_mut() = Header::Create(bad_create_header.clone());
        *bad_original_goal_element.as_entry_mut() =
            ElementEntry::Present(bad_original_goal.clone().try_into().unwrap());
        let bad_original_entry_hash = bad_original_goal_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a Goal at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the Goal
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address.clone(),
            )))
            .times(1)
            .return_const(Ok(bad_original_goal_element.signed_header().clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                bad_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                bad_original_goal_element.entry().clone(),
            )
            .unwrap()));
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_goal(validate_data.clone()),
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

        let good_original_goal = fixt!(Goal);
        let mut good_original_goal_element = fixt!(Element);
        let good_create_header = fixt!(Create);
        *good_original_goal_element.as_header_mut() = Header::Create(good_create_header.clone());
        *good_original_goal_element.as_entry_mut() =
            ElementEntry::Present(good_original_goal.clone().try_into().unwrap());
        let good_original_entry_hash = good_original_goal_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();
        // set the user_hash on the goal equal to the original goals user_hash property
        // thus making them valid
        goal.user_hash = good_original_goal.user_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal.clone().try_into().unwrap());

        // it is as if there is a Goal at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address,
            )))
            .times(1)
            .return_const(Ok(good_original_goal_element.signed_header().clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                good_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                good_original_goal_element.entry().clone(),
            )
            .unwrap()));
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_goal(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_goal() {
        assert_eq!(
            validate_delete_entry_goal(fixt!(ValidateData)),
            Ok(ValidateCallbackResult::Valid),
        );
    }
    #[test]
    fn test_create_goal_with_edge() {}
}
