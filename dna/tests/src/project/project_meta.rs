#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::ProjectMetaFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::project_meta::crud::ProjectMeta;
    use projects::project::project_meta::validate::*;

    #[test]
    fn test_validate_create_entry_project_meta() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut project_meta = fixt!(ProjectMeta);
        *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_project_meta(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with a random
        // `address` it will fail (not the agent committing)
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(project_meta.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_project_meta(validate_data.clone()),
            Error::CorruptCreateAgentPubKeyReference.into(),
        );

        // success case:
        // make the `address` field valid by making it equal the
        // AgentPubKey of the agent committing

        project_meta.creator_address =
            WrappedAgentPubKey::new(create_header.author.as_hash().clone());
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(project_meta.clone().try_into().unwrap());

        // we should see that the ValidateCallbackResult
        // is valid
        assert_eq!(
            validate_create_entry_project_meta(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_update_entry_project_meta() {
        let mut validate_data = fixt!(ValidateData);
        let update_header = fixt!(Update);
        *validate_data.element.as_header_mut() = Header::Update(update_header.clone());
        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_update_entry_project_meta(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // make it pass first step by adding a project meta
        let mut project_meta = fixt!(ProjectMeta);
        // do this because for some reason the fixturator was occasionally
        // producing a NaN for the f64 for created_at field. Will
        // have to watch out for that weird behaviour
        project_meta.created_at = 102391293.0;
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(project_meta.clone().try_into().unwrap());

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        let invalid_original_project_meta = ProjectMeta {
            //make it invalid can't edit passphrase
            passphrase: "test".to_string(),
            ..project_meta.clone()
        };
        let mut invalid_original_project_meta_element = fixt!(Element);
        let invalid_create_header = fixt!(Create);
        *invalid_original_project_meta_element.as_header_mut() =
            Header::Create(invalid_create_header.clone());
        *invalid_original_project_meta_element.as_entry_mut() =
            ElementEntry::Present(invalid_original_project_meta.clone().try_into().unwrap());
        let invalid_original_entry_hash = invalid_original_project_meta_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a ProjectMeta at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address.clone(),
            )))
            .times(1)
            .return_const(Ok(invalid_original_project_meta_element
                .signed_header()
                .clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                invalid_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                invalid_original_project_meta_element.entry().clone(),
            )
            .unwrap()));
        set_hdk(mock_hdk);

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_update_entry_project_meta(validate_data.clone()),
            Error::ProjectMetaEditableFields.into(),
        );

        // SUCCESS CASE, can edit name and image (only)

        let valid_original_project_meta = ProjectMeta {
            //make it valid, by matching the rest, but name and image
            name: "test".to_string(),
            image: Some("hi".to_string()),
            ..project_meta
        };
        let mut valid_original_project_meta_element = fixt!(Element);
        let valid_create_header = fixt!(Create);
        *valid_original_project_meta_element.as_header_mut() =
            Header::Create(valid_create_header.clone());
        *valid_original_project_meta_element.as_entry_mut() =
            ElementEntry::Present(valid_original_project_meta.clone().try_into().unwrap());
        let valid_original_entry_hash = valid_original_project_meta_element
            .signed_header()
            .header()
            .entry_hash()
            .unwrap();

        // it is as if there is a ProjectMeta at the original address
        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the goal_address
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                update_header.original_header_address.clone(),
            )))
            .times(1)
            .return_const(Ok(valid_original_project_meta_element
                .signed_header()
                .clone()));
        mock_hdk
            .expect_must_get_entry()
            .with(mockall::predicate::eq(MustGetEntryInput::new(
                valid_original_entry_hash.clone(),
            )))
            .times(1)
            .return_const(Ok(option_entry_hashed(
                valid_original_project_meta_element.entry().clone(),
            )
            .unwrap()));
        set_hdk(mock_hdk);

        // valid!
        assert_eq!(
            validate_update_entry_project_meta(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_delete_entry_project_meta() {
        let mut validate_data = fixt!(ValidateData);
        let delete_header = fixt!(Delete);
        *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
        assert_eq!(
            validate_delete_entry_project_meta(validate_data),
            Error::DeleteAttempted.into(),
        );
    }
}
