#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::OutcomeVoteFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::AgentPubKeyB64;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::outcome_vote::validate::*;

    #[test]
    fn test_validate_create_entry_outcome_vote() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut outcome_vote = fixt!(OutcomeVote);
        // set is_imported to false so that we don't skip
        // important validation
        outcome_vote.is_imported = false;

        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_outcome_vote(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        let outcome_wrapped_action_hash = fixt!(ActionHashB64);
        outcome_vote.outcome_action_hash = outcome_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_vote.clone().try_into().unwrap());

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
        outcome_vote.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_vote.clone().try_into().unwrap());

        assert_eq!(
            validate_create_entry_outcome_vote(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent outcome is found/exists
        // is_imported is false and creator_agent_pub_key refers to the agent committing (or is_imported is true)
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
        outcome_vote.creator_agent_pub_key = AgentPubKeyB64::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_vote.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_outcome_vote(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_update_entry_outcome_vote() {
        let mut validate_data = fixt!(ValidateData);
        let update_header = fixt!(Update);
        let mut outcome_vote = fixt!(OutcomeVote);
        *validate_data.element.as_header_mut() = Header::Update(update_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_update_entry_outcome_vote(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a random
        // creator_agent_pub_key it will fail (not the agent committing)
        let outcome_wrapped_action_hash = fixt!(ActionHashB64);
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome_vote.outcome_action_hash = outcome_wrapped_action_hash.clone();
        outcome_vote.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_vote.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_outcome_vote(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // make the creator_agent_pub_key valid by making it equal the
        // AgentPubKey of the agent committing,
        // but it will still be missing the original OutcomeVote
        // dependency so it will
        // return UnresolvedDependencies
        outcome_vote.creator_agent_pub_key = AgentPubKeyB64::new(update_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_vote.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // make it now resolve the original OutcomeVote
        // but now be invalid according to the original OutcomeVote
        // being authored by a different author than this Update

        // due to being random, it will have a different author
        // than our Update header
        let bad_original_outcome_vote = fixt!(OutcomeVote);
        let mut bad_original_outcome_vote_element = fixt!(Element);
        let bad_create_header = fixt!(Create);
        *bad_original_outcome_vote_element.as_header_mut() =
            Header::Create(bad_create_header.clone());
        *bad_original_outcome_vote_element.as_entry_mut() =
            ElementEntry::Present(bad_original_outcome_vote.clone().try_into().unwrap());
        let bad_original_entry_hash = bad_original_outcome_vote_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is an OutcomeComment at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(update_header.original_header_address.clone()),
            Ok(bad_original_outcome_vote_element.signed_header().clone()),
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(bad_original_entry_hash.clone()),
            Ok(option_entry_hashed(bad_original_outcome_vote_element.entry().clone()).unwrap()),
        );
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_outcome_vote(validate_data.clone()),
            Error::UpdateOnNonAuthoredOriginal.into(),
        );

        // SUCCESS case
        // the element exists
        // creator_agent_pub_key refers to the agent committing
        // the original OutcomeVote header and entry exist
        // and the author of the update matches the original author
        // -> good to go
        let mut good_original_outcome_vote = fixt!(OutcomeVote);
        let mut good_original_outcome_vote_element = fixt!(Element);
        let good_create_header = fixt!(Create);
        *good_original_outcome_vote_element.as_header_mut() =
            Header::Create(good_create_header.clone());
        // make the author equal to the current `creator_agent_pub_key` value
        // on the Outcome in validate_data
        good_original_outcome_vote.creator_agent_pub_key =
            AgentPubKeyB64::new(update_header.author.as_hash().clone());
        *good_original_outcome_vote_element.as_entry_mut() =
            ElementEntry::Present(good_original_outcome_vote.clone().try_into().unwrap());

        let good_original_entry_hash = good_original_outcome_vote_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is an OutcomeComment at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(update_header.original_header_address),
            Ok(good_original_outcome_vote_element.signed_header().clone()),
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(good_original_entry_hash.clone()),
            Ok(option_entry_hashed(good_original_outcome_vote_element.entry().clone()).unwrap()),
        );
        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_update_entry_outcome_vote(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_outcome_vote() {
        let mut validate_data = fixt!(ValidateData);
        let delete_header = fixt!(Delete);
        *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
        assert_eq!(
            validate_delete_entry_outcome_vote(validate_data),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
