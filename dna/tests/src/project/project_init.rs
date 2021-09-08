#[cfg(test)]
pub mod tests {
    use crate::project::fixtures::fixtures::ProjectMetaFixturator;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::WrappedAgentPubKey;
    use holochain_types::prelude::option_entry_hashed;
    use holochain_types::prelude::ElementFixturator;
    use holochain_types::prelude::ValidateDataFixturator;
    use projects::project::error::Error;
    use projects::project::project_meta::crud::ProjectMeta;
    use projects::project::project_meta::validate::*;
    use projects::init;

    #[test]
    fn test_init() {
               
        let mut mock_hdk = MockHdkT::new();
        
        let zome_info = fixt!(ZomeInfo);
        // do these mock functions need to be called in the same order as the actual code?
        // init calls create_receive_signal_cap_grant, which calls zome_info and create_cap_grant
        mock_hdk
            .expect_zome_info()
            .times(1)
            .return_const(Ok(zome_info.clone())); // define what it should return when it matches the `with` statement, or matches at all (without `.with`)

        // create_cap_grant calls just `create` under the hood
        let mut functions: GrantedFunctions = BTreeSet::new();
        functions.insert((zome_info.zome_name, "recv_remote_signal".into()));
        // expected is for the .with, and is b/c create parameter is of type EntryWithDefId
        let expected = EntryWithDefId::new(
            EntryDefId::CapGrant,
            Entry::CapGrant(CapGrantEntry {
                tag: "".into(),
                access: ().into(),
                functions,
            }),
        );
        let header_hash = fixt!(HeaderHash);
        mock_hdk
            .expect_create()
            .with(mockall::predicate::eq(expected))
            .times(1)
            .return_const(Ok(header_hash.clone()));
        
        // init also calls join_project_during_init, drilling down, it calls the following hdk functions under the hood
        // TODO: handle cases where a path with 1 or more parents doesn't yet exist in the DHT (this would call `create` and `create_link` additional times)
        let entry_hash = fixt!(EntryHash);
        mock_hdk
            .expect_hash_entry()
            .times(3)
            .return_const(Ok(entry_hash.clone()));

        let expected_output = fixt!(Element);
        let exp_vec = vec![Some(expected_output)];
        mock_hdk
            .expect_get()
            .times(1)
            .return_const(ExternResult::Ok(exp_vec));

        let agent_info = fixt!(AgentInfo);

        mock_hdk
            .expect_agent_info()
            .times(1)
            .return_const(Ok(agent_info.clone()));
        
        mock_hdk
            .expect_create()
            .times(1)
            .return_const(Ok(header_hash.clone()));
        
        mock_hdk
            .expect_create_link()
            .times(1)
            .return_const(Ok(header_hash));

        set_hdk(mock_hdk);

        let result = init(());
        assert_eq!(result.is_ok(), true);
    }
}
