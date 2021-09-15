#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::{EdgeFixturator, WrappedHeaderHashFixturator};
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedHeaderHash;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::edge::validate::*;
    use projects::project::error::Error;

    #[test]
    fn test_validate_update_entry_edge() {
        assert_eq!(
            validate_update_entry_edge(fixt!(ValidateData)),
            Error::UpdateAttempted.into(),
        );
    }

    #[test]
    fn test_validate_delete_entry_edge() {
        assert_eq!(
            validate_delete_entry_edge(fixt!(ValidateData)),
            Ok(ValidateCallbackResult::Valid),
        );
    }

    #[test]
    fn test_validate_create_entry_edge() {
        let mut validate_data = fixt!(ValidateData);
        let create_header = fixt!(Create);
        let mut edge = fixt!(Edge);

        *validate_data.element.as_header_mut() = Header::Create(create_header);

        // without an Element containing an Entry, validation will fail
        assert_eq!(
            validate_create_entry_edge(validate_data.clone()),
            Error::DeserializationFailed.into(),
        );

        // with an entry with identical hash for parent_address and
        // child_address validation will fail
        let goal_wrapped_header_hash = fixt!(WrappedHeaderHash);
        edge.parent_address = goal_wrapped_header_hash.clone();
        edge.child_address = goal_wrapped_header_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(edge.clone().try_into().unwrap());
        assert_eq!(
            validate_create_entry_edge(validate_data.clone()),
            Error::IdenticalParentChild.into(),
        );

        // now, since validation is dependent on other entries, we begin
        // to have to mock `get` calls to the HDK

        // SUCCESS case
        // the element exists
        // parent_address and child_address are not identical
        // the parent goal is found/exists
        // the child goal is found/exists
        // -> good to go

        let parent_signed_header_hashed = fixt!(SignedHeaderHashed);
        let goal_parent_wrapped_header_hash =
            WrappedHeaderHash::new(parent_signed_header_hashed.as_hash().clone());
        let child_signed_header_hashed = fixt!(SignedHeaderHashed);
        let goal_child_wrapped_header_hash =
            WrappedHeaderHash::new(child_signed_header_hashed.as_hash().clone());
        // we assign different parent and child to pass that level of validation
        edge.parent_address = goal_parent_wrapped_header_hash.clone();
        edge.child_address = goal_child_wrapped_header_hash.clone();
        *validate_data.element.as_entry_mut() =
            ElementEntry::Present(edge.clone().try_into().unwrap());

        let mut mock_hdk = MockHdkT::new();
        // the must_get_header call for the parent goal
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                goal_parent_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(parent_signed_header_hashed));

        // the must_get_header call for the child goal
        mock_hdk
            .expect_must_get_header()
            .with(mockall::predicate::eq(MustGetHeaderInput::new(
                goal_child_wrapped_header_hash.clone().0,
            )))
            .times(1)
            .return_const(Ok(child_signed_header_hashed));

        set_hdk(mock_hdk);

        // we should see that the ValidateCallbackResult
        // is finally valid
        assert_eq!(
            validate_create_entry_edge(validate_data.clone()),
            Ok(ValidateCallbackResult::Valid),
        );
    }
}
