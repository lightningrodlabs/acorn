#[cfg(test)]
pub mod tests {
    use ::fixt::prelude::*;
    use assert_matches::assert_matches;
    use hdk::prelude::*;
    use holo_hash::AgentPubKeyB64;
    use holochain_types::prelude::ElementFixturator;
    use projects::init;
    use projects::project::member::entry::Member;

    /// Unit testing the `init()` function that is called to ensure an agent can receive signals
    /// and is listed as a member in the project. There are two main functions called within `init()`: `create_receive_signal_cap_grant()`
    /// and `join_project_during_init()`. The first function creates a capabilities grant token
    /// allowing other agents to call a specified zome function (used for sending signals for responsive UI updates)
    /// and the second function creates a member entry and links it to MEMBER_PATH
    #[test]
    fn test_init() {
        let mut mock_hdk = MockHdkT::new();

        // make a mutable reference to mock_hdk so that it can be mutated with each function
        let mock_hdk_ref = &mut mock_hdk;

        // setup a mock of `create_receive_signal_cap_grant` because it is called by `init`
        setup_create_receive_signal_cap_grant_mock(mock_hdk_ref);

        // setup a mock of `join_project_during_init` because it is called by `init`
        setup_join_project_during_init_mock(mock_hdk_ref);

        set_hdk(mock_hdk);
        let result = init(());
        assert_matches!(result, Ok(InitCallbackResult::Pass));
    }
    fn setup_create_receive_signal_cap_grant_mock(mock_hdk: &mut MockHdkT) {
        let zome_info = fixt!(ZomeInfo);
        // init calls create_receive_signal_cap_grant, which calls zome_info and create_cap_grant
        mock_hdk
            .expect_zome_info()
            .times(1)
            .return_const(Ok(zome_info.clone()));

        // create_cap_grant calls just `create` under the hood
        let mut functions: GrantedFunctions = BTreeSet::new();
        functions.insert((zome_info.name, "recv_remote_signal".into()));
        // expected is for the .with, and is b/c create parameter is of type EntryWithDefId
        let expected = CreateInput::new(
            EntryDefId::CapGrant,
            Entry::CapGrant(CapGrantEntry {
                tag: "".into(),
                access: ().into(),
                functions,
            }),
            ChainTopOrdering::default()
        );
        let header_hash = fixt!(HeaderHash);
        mock_hdk
            .expect_create()
            .with(mockall::predicate::eq(expected))
            .times(1)
            .return_const(Ok(header_hash.clone()));
    }
    fn setup_join_project_during_init_mock(mock_hdk: &mut MockHdkT) {
        // TODO: test when the MEMBER_PATH doesn't exist in DHT
        let member_path = Path::from("member");
        let member_path_entry = Entry::try_from(member_path).unwrap();
        let member_path_entry_hash = fixt!(EntryHash);
        mock_hdk
            .expect_hash_entry() // called from `Path::from(MEMBER_PATH).ensure()?;`
            .with(mockall::predicate::eq(member_path_entry.clone()))
            .times(1)
            .return_const(Ok(member_path_entry_hash.clone()));

        let member_path_get_input = vec![GetInput::new(
            AnyDhtHash::from(member_path_entry_hash.clone()),
            GetOptions::content(),
        )];
        // assuming the path exists on DHT
        let expected_get_output = vec![Some(fixt!(Element))];
        mock_hdk
            .expect_get() // called from `Path::from(MEMBER_PATH).ensure()?;`
            .with(mockall::predicate::eq(member_path_get_input))
            .times(1)
            .return_const(Ok(expected_get_output));

        mock_hdk
            .expect_hash_entry() // called from `let member_path_address = Path::from(MEMBER_PATH).path_entry_hash()?;`
            .with(mockall::predicate::eq(member_path_entry.clone()))
            .times(1)
            .return_const(Ok(member_path_entry_hash.clone()));

        let agent_info = fixt!(AgentInfo);
        mock_hdk
            .expect_agent_info()
            .times(1)
            .return_const(Ok(agent_info.clone()));

        let member = Member {
            address: AgentPubKeyB64::new(agent_info.agent_initial_pubkey),
        };
        let header_hash = fixt!(HeaderHash);
        let create_member_input = CreateInput::try_from(member.clone()).unwrap();
        mock_hdk
            .expect_create()
            .with(mockall::predicate::eq(create_member_input))
            .times(1)
            .return_const(Ok(header_hash.clone()));

        let member_hash = fixt!(EntryHash);
        let member_entry = Entry::try_from(member.clone()).unwrap();
        mock_hdk
            .expect_hash_entry() // called from `let member_entry_hash = hash_entry(&member)?;`
            .with(mockall::predicate::eq(member_entry))
            .times(1)
            .return_const(Ok(member_hash.clone()));
        let create_link_input =
            CreateLinkInput::new(member_path_entry_hash, member_hash, LinkTag::from(()), ChainTopOrdering::default());
        mock_hdk
            .expect_create_link()
            .with(mockall::predicate::eq(create_link_input))
            .times(1)
            .return_const(Ok(header_hash));
    }
}
