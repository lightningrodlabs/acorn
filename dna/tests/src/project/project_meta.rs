#[cfg(test)]
pub mod tests {
    use crate::project::fixtures::fixtures::ProjectMetaFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
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

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original ProjectMeta
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            // act as if not present / not found
            .return_const(Ok(vec![None]));

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult is that there are UnresolvedDependencies
        // equal to the Hash of the original_header_address of the Update
        assert_eq!(
            validate_update_entry_project_meta(validate_data.clone()),
            Ok(ValidateCallbackResult::UnresolvedDependencies(vec![
                update_header.original_header_address.clone().into()
            ])),
        );

        let invalid_original_project_meta = ProjectMeta {
            //make it invalid can't edit passphrase
            passphrase: "test".to_string(),
            ..project_meta.clone()
        };
        let mut invalid_original_project_meta_element = fixt!(Element);
        *invalid_original_project_meta_element.as_entry_mut() =
            ElementEntry::Present(invalid_original_project_meta.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original_header_address
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(invalid_original_project_meta_element)]));

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
        *valid_original_project_meta_element.as_entry_mut() =
            ElementEntry::Present(valid_original_project_meta.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        // the resolve_dependencies `get` call of the original_header_address
        mock_hdk
            .expect_get()
            .with(mockall::predicate::eq(vec![GetInput::new(
                update_header.original_header_address.clone().into(),
                GetOptions::content(),
            )]))
            .times(1)
            .return_const(Ok(vec![Some(valid_original_project_meta_element)]));

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
