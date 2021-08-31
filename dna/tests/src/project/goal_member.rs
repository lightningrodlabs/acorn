#[cfg(test)]
pub mod tests {
    use crate::project::fixtures::fixtures::{
        GoalMemberFixturator, WrappedAgentPubKeyFixturator,
        WrappedHeaderHashFixturator,
    };
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::goal_member::validate::*;

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
            validate_create_entry_goal_member(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // make it pass EntryMissing by adding the Element
        let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
        goal_member.goal_address = goal_wrapped_header_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_member.clone().try_into().unwrap());

        // make it pass UnresolvedDependencies
        // by making it as if there is a Goal at the goal_address
        let mut goal_element_for_invalid = fixt!(Element);
        let create_header_for_invalid = fixt!(Create);
        *goal_element_for_invalid.as_header_mut() = Header::Create(create_header_for_invalid.clone());

        let mut mock_hdk = MockHdkT::new();
        // mock the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
              goal_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(goal_element_for_invalid
                .signed_header()
                .clone()));
        set_hdk(mock_hdk);

        // with an entry with a random
        // user_edit_hash it will fail (not the agent committing)
        let random_wrapped_agent_pub_key = fixt!(WrappedAgentPubKey);
        goal_member.user_edit_hash = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_member.clone().try_into().unwrap());

        assert_eq!(
            validate_create_entry_goal_member(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent goal is found/exists
        // is_imported is false and creator_address refers to the agent committing (or is_imported = true)
        // -> good to go

        // make it pass UnresolvedDependencies
        // by making it as if there is a Goal at the goal_address
        let mut goal_element_for_valid = fixt!(Element);
        let create_header_for_valid = fixt!(Create);
        *goal_element_for_valid.as_header_mut() = Header::Create(create_header_for_valid.clone());

        let mut mock_hdk = MockHdkT::new();
        // mock the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
              goal_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(goal_element_for_valid
                .signed_header()
                .clone()));
        set_hdk(mock_hdk);

        // make the user_edit_hash valid by making it equal the
        // AgentPubKey of the agent committing,
        // but it will still be missing the goal dependency so it will
        // return UnresolvedDependencies
        goal_member.user_edit_hash =
            WrappedAgentPubKey::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(goal_member.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_goal_member(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
