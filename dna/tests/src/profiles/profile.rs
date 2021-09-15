#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::{
        EdgeFixturator, ProfileFixturator, WrappedAgentPubKeyFixturator,
        WrappedHeaderHashFixturator,
    };
    use crate::test_lib::*;
    use ::fixt::prelude::*;
    use assert_matches::assert_matches;
    use hdk::prelude::*;
    use hdk_crud::{ActionType, WrappedAgentPubKey, WrappedHeaderHash};
    use holochain_types::prelude::ValidateDataFixturator;
    use profiles::profile::{
        agent_signal_entry_type, create_imported_profile, inner_create_whoami, inner_update_whoami,
        AgentSignal, Profile, SignalData, Status, WireEntry,
    };
    use projects::project::edge::validate::*;
    use projects::project::error::Error;

    #[test]
    fn test_create_whoami() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let wire_entry = generate_wire_entry();
        let profile = wire_entry.clone().entry;
        let profile_entry = EntryWithDefId::try_from(profile.clone()).unwrap();
        let profile_header_hash = wire_entry.clone().address.0;
        mock_create(mock_hdk_ref, profile_entry, Ok(profile_header_hash.clone()));

        let profile_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(profile.clone()).unwrap(),
            Ok(profile_hash.clone()),
        );

        let agent_path = Path::from("agents");
        let agent_path_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path).unwrap(),
            Ok(agent_path_hash.clone()),
        );

        let create_link_input = CreateLinkInput::new(
            agent_path_hash.clone(),
            profile_hash.clone(),
            LinkTag::from(()),
        );
        let link_header_hash = fixt!(HeaderHash);
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_header_hash.clone()),
        );

        let agent_info = fixt!(AgentInfo);
        let agent_entry_hash = EntryHash::from(agent_info.clone().agent_initial_pubkey);
        mock_agent_info(mock_hdk_ref, Ok(agent_info));
        let create_link_input =
            CreateLinkInput::new(agent_entry_hash, profile_hash, LinkTag::from(()));
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_header_hash.clone()),
        );

        let signal = AgentSignal {
            entry_type: agent_signal_entry_type(),
            action: ActionType::Create,
            data: SignalData::Create(wire_entry.clone()),
        };

        let payload = ExternIO::encode(signal).unwrap();
        let agents = vec![];
        let remote_signal = RemoteSignal {
            signal: ExternIO::encode(payload).unwrap(),
            agents,
        };
        mock_remote_signal(mock_hdk_ref, remote_signal, Ok(()));

        set_hdk(mock_hdk);
        fn get_peers() -> ExternResult<Vec<AgentPubKey>> {
            Ok(vec![])
        }
        let result = inner_create_whoami(profile, get_peers);
        assert_matches!(result, Ok(wire_entry));
    }
    #[test]
    fn test_create_imported_profile() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let wire_entry = generate_wire_entry();
        let profile = wire_entry.clone().entry;
        let profile_entry = EntryWithDefId::try_from(profile.clone()).unwrap();
        let profile_header_hash = wire_entry.clone().address.0;

        mock_create(mock_hdk_ref, profile_entry, Ok(profile_header_hash.clone()));

        let profile_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(profile.clone()).unwrap(),
            Ok(profile_hash.clone()),
        );

        let agent_path = Path::from("agents");
        let agent_path_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path).unwrap(),
            Ok(agent_path_hash.clone()),
        );

        let create_link_input = CreateLinkInput::new(
            agent_path_hash.clone(),
            profile_hash.clone(),
            LinkTag::from(()),
        );
        let link_header_hash = fixt!(HeaderHash);
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_header_hash.clone()),
        );

        set_hdk(mock_hdk);
        let result = create_imported_profile(profile);
        assert_matches!(result, Ok(wire_entry));
    }
    #[test]
    fn test_update_whoami() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let wire_entry = generate_wire_entry();
        let profile_address = wire_entry.address.0.clone();
        let profile = wire_entry.entry.clone();
        let update_input =
            UpdateInput::new(profile_address, EntryWithDefId::try_from(profile).unwrap());
        let update_header_hash = fixt!(HeaderHash);
        mock_update(mock_hdk_ref, update_input, Ok(update_header_hash));

        let signal = AgentSignal {
            entry_type: agent_signal_entry_type(),
            action: ActionType::Update,
            data: SignalData::Update(wire_entry.clone()),
        };

        let payload = ExternIO::encode(signal).unwrap();
        let agents = vec![];
        let remote_signal = RemoteSignal {
            signal: ExternIO::encode(payload).unwrap(),
            agents,
        };
        mock_remote_signal(mock_hdk_ref, remote_signal, Ok(()));

        set_hdk(mock_hdk);
        fn get_peers() -> ExternResult<Vec<AgentPubKey>> {
            Ok(vec![])
        }
        let result = inner_update_whoami(wire_entry, get_peers);
        assert_matches!(result, Ok(wire_entry));
    }
    // #[test]
    // fn test_whoami() {}
    // #[test]
    // fn test_fetch_agents() {}

    /// generate an arbitrary `WireEntry` for unit testing
    fn generate_wire_entry() -> WireEntry {
        let profile = fixt!(Profile);
        let profile_header_hash = fixt!(HeaderHash);
        let wire_entry = WireEntry {
            entry: profile,
            address: WrappedHeaderHash(profile_header_hash),
        };
        wire_entry
    }
}
