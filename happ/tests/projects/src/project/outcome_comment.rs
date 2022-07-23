#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::OutcomeCommentFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::AgentPubKeyB64;
    use holo_hash::ActionHashB64;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::outcome_comment::validate::*;

    #[test]
    fn test_validate_create_entry_outcome_comment() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut outcome_comment = fixt!(OutcomeComment);
        // set is_imported to false so that we don't skip
        // important validation
        outcome_comment.is_imported = false;

        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_outcome_comment(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        let outcome_signed_action_hashed = fixt!(SignedHeaderHashed);
        let outcome_wrapped_action_hash =
            ActionHashB64::new(outcome_signed_action_hashed.as_hash().clone());
        outcome_comment.outcome_action_hash = outcome_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_comment.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // now make it as if there is an Outcome at the outcome_action_hash
        // so that we pass the dependency validation

        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_signed_action_hashed.clone()),
        );
        set_hdk(mock_hdk);

        // with an entry with a random
        // creator_agent_pub_key it will fail (not the agent committing)
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome_comment.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_comment.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_outcome_comment(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent outcome is found/exists
        // creator_agent_pub_key refers to the agent committing
        // -> good to go

        // make the creator_agent_pub_key valid by making it equal the
        // AgentPubKey of the agent committing
        outcome_comment.creator_agent_pub_key = AgentPubKeyB64::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_comment.clone().try_into().unwrap());

        // it is as if there is a header for an Outcome at the outcome_action_hash
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_signed_action_hashed.clone()),
        );

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_outcome_comment(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_update_entry_outcome_comment() {
        let mut validate_data = fixt!(ValidateData);
        let update_header = fixt!(Update);
        let mut outcome_comment = fixt!(OutcomeComment);
        *validate_data.element.as_header_mut() = Header::Update(update_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_update_entry_outcome_comment(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a random
        // creator_agent_pub_key it will fail (not the agent committing)
        let outcome_wrapped_action_hash = fixt!(ActionHashB64);
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome_comment.outcome_action_hash = outcome_wrapped_action_hash.clone();
        outcome_comment.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_comment.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_outcome_comment(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // make the creator_agent_pub_key valid by making it equal the
        // AgentPubKey of the agent committing,
        // but it will still be missing the original OutcomeComment
        // dependency so it will
        // return UnresolvedDependencies
        outcome_comment.creator_agent_pub_key = AgentPubKeyB64::new(update_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome_comment.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // make it now resolve the original OutcomeComment
        // but now be invalid according to the original OutcomeComment
        // being authored by a different author than this update

        let bad_original_outcome_comment = fixt!(OutcomeComment);
        // but due to being random, it will have a different author
        // than our Update header
        let mut bad_original_outcome_comment_element = fixt!(Element);
        let bad_create_header = fixt!(Create);
        *bad_original_outcome_comment_element.as_header_mut() =
            Header::Create(bad_create_header.clone());
        *bad_original_outcome_comment_element.as_entry_mut() =
            ElementEntry::Present(bad_original_outcome_comment.clone().try_into().unwrap());
        let bad_original_entry_hash = bad_original_outcome_comment_element
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
            Ok(bad_original_outcome_comment_element.signed_header().clone()),
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(bad_original_entry_hash.clone()),
            Ok(option_entry_hashed(bad_original_outcome_comment_element.entry().clone()).unwrap()),
        );
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_outcome_comment(validate_data.clone()),
            Error::UpdateOnNonAuthoredOriginal.into(),
        );

        // SUCCESS case
        // the element exists
        // creator_agent_pub_key refers to the agent committing
        // the original OutcomeComment header and entry exist
        // and the author of the update matches the original author
        // -> good to go
        let mut good_original_outcome_comment = fixt!(OutcomeComment);
        let mut good_original_outcome_comment_element = fixt!(Element);
        let good_create_header = fixt!(Create);
        *good_original_outcome_comment_element.as_header_mut() =
            Header::Create(good_create_header.clone());
        // make the author equal to the current `creator_agent_pub_key` value
        // on the Outcome in validate_data
        good_original_outcome_comment.creator_agent_pub_key =
            AgentPubKeyB64::new(update_header.author.as_hash().clone());
        *good_original_outcome_comment_element.as_entry_mut() =
            ElementEntry::Present(good_original_outcome_comment.clone().try_into().unwrap());

        let good_original_entry_hash = good_original_outcome_comment_element
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
            Ok(good_original_outcome_comment_element
                .signed_header()
                .clone()),
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(good_original_entry_hash.clone()),
            Ok(option_entry_hashed(good_original_outcome_comment_element.entry().clone()).unwrap()),
        );
        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_update_entry_outcome_comment(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_outcome_comment() {
        let mut validate_data = fixt!(ValidateData);
        let delete_header = fixt!(Delete);
        *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
        assert_eq!(
            validate_delete_entry_outcome_comment(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
