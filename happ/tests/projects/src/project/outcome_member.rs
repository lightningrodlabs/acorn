#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::OutcomeMemberFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::AgentPubKeyB64;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::outcome_member::validate::*;

    #[test]
    fn test_validate_create_entry_outcome_member() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut outcome_member = fixt!(OutcomeMember);
        // set is_imported to false so that we don't skip
        // important validation
        outcome_member.is_imported = false;

        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_outcome_member(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // make it pass EntryMissing by adding the Element
        let outcome_wrapped_action_hash = fixt!(ActionHashB64);
        outcome_member.outcome_action_hash = outcome_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_member.clone().try_into().unwrap());

        // make it pass UnresolvedDependencies
        // by making it as if there is an Outcome at the outcome_action_hash
        let mut outcome_element_for_invalid = fixt!(Element);
        let create_header_for_invalid = fixt!(Create);
        *outcome_element_for_invalid.as_header_mut() =
            Header::Create(create_header_for_invalid.clone());

        let mut mock_hdk = MockHdkT::new();
        // mock the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_element_for_invalid.signed_header().clone()),
        );
        set_hdk(mock_hdk);

        // with an entry with a random
        // creator_agent_pub_key it will fail (not the agent committing)
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome_member.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_member.clone().try_into().unwrap());

        assert_eq!(
            validate_create_entry_outcome_member(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent outcome is found/exists
        // is_imported is false and creator_agent_pub_key refers to the agent committing (or is_imported = true)
        // -> good to go

        // make it pass UnresolvedDependencies
        // by making it as if there is an Outcome at the outcome_action_hash
        let mut outcome_element_for_valid = fixt!(Element);
        let create_header_for_valid = fixt!(Create);
        *outcome_element_for_valid.as_header_mut() =
            Header::Create(create_header_for_valid.clone());

        let mut mock_hdk = MockHdkT::new();
        // mock the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_element_for_valid.signed_header().clone()),
        );
        set_hdk(mock_hdk);

        // make the creator_agent_pub_key valid by making it equal the
        // AgentPubKey of the agent committing,
        // but it will still be missing the outcome dependency so it will
        // return UnresolvedDependencies
        outcome_member.creator_agent_pub_key = AgentPubKeyB64::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_member.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_outcome_member(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
