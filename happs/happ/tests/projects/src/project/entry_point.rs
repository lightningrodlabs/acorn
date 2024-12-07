#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::EntryPointFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::{AgentPubKeyB64, ActionHashB64};
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::entry_point::validate::*;
    use projects::project::error::Error;

    #[test]
    fn test_validate_update_entry_entry_point() {
        assert_eq!(
            validate_update_entry_entry_point(fixt!(ValidateData)),
            Error::UpdateAttempted.into(),
        );
    }

    #[test]
    fn test_validate_delete_entry_entry_point() {
        assert_eq!(
            validate_delete_entry_entry_point(fixt!(ValidateData)),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_create_entry_entry_point() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut entry_point = fixt!(EntryPoint);
        // set is_imported to false so that we don't skip
        // important validation
        entry_point.is_imported = false;

        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_entry_point(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // now make it pass DeserializationFailed by adding an ElementEntry::Present
        let outcome_signed_action_hashed = fixt!(SignedHeaderHashed);
        let outcome_wrapped_action_hash =
            ActionHashB64::new(outcome_signed_action_hashed.as_hash().clone());
        entry_point.outcome_action_hash = outcome_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(entry_point.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // now make it valid by making it
        // as if there is an Outcome at the outcome_action_hash
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the outcome_action_hash
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_signed_action_hashed.clone()),
        );

        set_hdk(mock_hdk);

        // with an entry with a random (not the agent committing)
        // creator_agent_pub_key it will fail
        let random_wrapped_agent_pub_key = fixt!(AgentPubKeyB64);
        entry_point.creator_agent_pub_key = random_wrapped_agent_pub_key.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(entry_point.clone().try_into().unwrap());

        assert_eq!(
            validate_create_entry_entry_point(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // SUCCESS case
        // the element exists
        // the parent outcome is found/exists
        // is_imported is false and creator_agent_pub_key refers to the agent committing (or is_imported = true)
        // -> good to go

        // make it as if there is an Outcome at the outcome_action_hash

        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_wrapped_action_hash.clone().into()),
            Ok(outcome_signed_action_hashed.clone()),
        );

        set_hdk(mock_hdk);

        // make the creator_agent_pub_key valid by making it equal the
        // AgentPubKey of the agent committing,
        entry_point.creator_agent_pub_key = AgentPubKeyB64::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(entry_point.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_entry_point(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
