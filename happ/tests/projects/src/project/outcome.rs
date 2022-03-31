#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::{OutcomeFixturator};
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::AgentPubKeyB64;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::outcome::validate::*;

    #[test]
    fn test_validate_create_entry_outcome() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut outcome = fixt!(Outcome);
        // set is_imported to false so that we don't skip
        // important validation
        outcome.is_imported = false;

        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_outcome(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a random (not the agent committing)
        // user_hash it will fail
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome.user_hash = random_wrapped_agent_pub_key.clone();
        outcome.user_edit_hash = None;
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_outcome(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // with the right user_hash for the author
        // but with a Some value for user_edit_hash it should
        // fail since we are doing a create

        // make the user_hash valid by making it equal the
        // AgentPubKey of the agent committing
        outcome.user_hash = AgentPubKeyB64::new(create_header.author.as_hash().clone());
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        // make the user_edit_hash value bad by filling it with anything
        // even the author's key during create action
        outcome.user_edit_hash = Some(random_wrapped_agent_pub_key.clone());
        // update the outcome value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_outcome(validate_data.clone()),
            Error::SomeNotNoneDuringCreate.into(),
        );

        // SUCCESS case
        // the element exists and deserializes
        // user_hash refers to the agent committing
        // user_edit_hash is None
        // -> good to go

        outcome.user_edit_hash = None;
        // update the outcome value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_outcome(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_update_entry_outcome() {
        let mut validate_data = fixt!(ValidateData);
        let update_header = fixt!(Update);
        let mut outcome = fixt!(Outcome);

        *validate_data.element.as_header_mut() = Header::Update(update_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_update_entry_outcome(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a
        // user_edit_hash None it will fail
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        outcome.user_hash = random_wrapped_agent_pub_key.clone();
        outcome.user_edit_hash = None;
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_outcome(validate_data.clone()),
            Error::NoneNotSomeDuringEdit.into(),
        );

        // with a random user_edit_hash (not the author agent)
        // it will fail
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        // make the user_edit_hash value bad by filling it with a random author
        outcome.user_edit_hash = Some(random_wrapped_agent_pub_key.clone());
        // update the outcome value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());
        assert_eq!(
            validate_update_entry_outcome(validate_data.clone()),
            Error::CorruptEditAgentPubKeyReference.into(),
        );

        // with a valid user_edit_hash, we move on to the issue
        // of the `user_hash`. Is it equal to the original author?
        // to know this, we need to resolve that dependency
        outcome.user_edit_hash = Some(AgentPubKeyB64::new(
            update_header.author.as_hash().clone(),
        ));
        // update the outcome value in the validate_data
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // now assuming it can be found, we have the question of the header
        // of the original, which we will be checking the author against
        // in the case where it's a different original author, FAIL
        // suggests inappropriate data tampering

        let bad_original_outcome = fixt!(Outcome);
        let mut bad_original_outcome_element = fixt!(Element);
        let bad_create_header = fixt!(Create);
        *bad_original_outcome_element.as_header_mut() = Header::Create(bad_create_header.clone());
        *bad_original_outcome_element.as_entry_mut() =
            ElementEntry::Present(bad_original_outcome.clone().try_into().unwrap());
        let bad_original_entry_hash = bad_original_outcome_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a Outcome at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the Outcome
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref, 
            MustGetHeaderInput::new(
                update_header.original_header_address.clone(),
            ),
            Ok(bad_original_outcome_element.signed_header().clone())
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(
                bad_original_entry_hash.clone(),
            ),
            Ok(option_entry_hashed(
                bad_original_outcome_element.entry().clone(),
            )
            .unwrap())
        );
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_outcome(validate_data.clone()),
            Ok(Error::TamperCreateAgentPubKeyReference.into()),
        );

        // SUCCESS case
        // the element exists and deserializes
        // user_edit_hash is Some(the author)
        // original_header_address exists, and the value
        // `user_hash` of the original Outcome
        // is equal to the new `user_hash` value
        // -> good to go
        // we should see that the ValidateCallbackResult
        // is finally valid

        let good_original_outcome = fixt!(Outcome);
        let mut good_original_outcome_element = fixt!(Element);
        let good_create_header = fixt!(Create);
        *good_original_outcome_element.as_header_mut() = Header::Create(good_create_header.clone());
        *good_original_outcome_element.as_entry_mut() =
            ElementEntry::Present(good_original_outcome.clone().try_into().unwrap());
        let good_original_entry_hash = good_original_outcome_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();
        // set the user_hash on the outcome equal to the original outcomes user_hash property
        // thus making them valid
        outcome.user_hash = good_original_outcome.user_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(outcome.clone().try_into().unwrap());

        // it is as if there is a Outcome at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_address
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref, 
            MustGetHeaderInput::new(
                update_header.original_header_address,
            ),
            Ok(good_original_outcome_element.signed_header().clone())
        );
        mock_must_get_entry(
            mock_hdk_ref,
            MustGetEntryInput::new(
                good_original_entry_hash.clone(),
            ),
            Ok(option_entry_hashed(
                good_original_outcome_element.entry().clone(),
            )
            .unwrap())
        );
        set_hdk(mock_hdk);

        assert_eq!(
            validate_update_entry_outcome(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_outcome() {
        assert_eq!(
            validate_delete_entry_outcome(fixt!(ValidateData)),
            Ok(ValidateCallbackResult::Valid),
        );
    }
    #[test]
    fn test_create_outcome_with_connection() {}
}
