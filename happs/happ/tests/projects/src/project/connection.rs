#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::ConnectionFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::ActionHashB64;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::connection::validate::*;
    use projects::project::error::Error;

    #[test]
    fn test_validate_update_entry_connection() {
        assert_eq!(
            validate_update_entry_connection(fixt!(ValidateData)),
            Error::UpdateAttempted.into(),
        );
    }

    #[test]
    fn test_validate_delete_entry_connection() {
        assert_eq!(
            validate_delete_entry_connection(fixt!(ValidateData)),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_create_entry_connection() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut connection = fixt!(Connection);

        *validate_data.element.as_header_mut() = Header::Create(create_header);

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_connection(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with identical hash for parent_action_hash and
        // child_action_hash validation will fail
        let outcome_wrapped_action_hash = fixt!(ActionHashB64);
        connection.parent_action_hash = outcome_wrapped_action_hash.clone();
        connection.child_action_hash = outcome_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(connection.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_connection(validate_data.clone()),
            Error::IdenticalParentChild.into(),
        );

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // SUCCESS case
        // the element exists
        // parent_action_hash and child_action_hash are not identical
        // the parent outcome is found/exists
        // the child outcome is found/exists
        // -> good to go

        let parent_signed_action_hashed = fixt!(SignedHeaderHashed);
        let outcome_parent_wrapped_action_hash =
            ActionHashB64::new(parent_signed_action_hashed.as_hash().clone());
        let child_signed_action_hashed = fixt!(SignedHeaderHashed);
        let outcome_child_wrapped_action_hash =
            ActionHashB64::new(child_signed_action_hashed.as_hash().clone());
        // we assign different parent and child to pass that level of validation
        connection.parent_action_hash = outcome_parent_wrapped_action_hash.clone();
        connection.child_action_hash = outcome_child_wrapped_action_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(connection.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_parent_wrapped_action_hash.clone().into()),
            Ok(parent_signed_action_hashed),
        );

        // the must_get_header call for the child outcome
        mock_must_get_header(
            mock_hdk_ref,
            MustGetHeaderInput::new(outcome_child_wrapped_action_hash.clone().into()),
            Ok(child_signed_action_hashed),
        );

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_connection(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
