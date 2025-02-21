#[cfg(test)]
pub mod tests {
    use crate::fixtures::fixtures::ProfileFixturator;
    // use crate::test_lib::*;
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::signals::ActionType;
    use hdk_crud::wire_record::WireRecord;
    use hdk_unit_testing::mock_hdk::*;
    use hdk_unit_testing::mock_hdk::*;
    use holo_hash::{EntryHashB64, ActionHashB64};
    use profiles::profile::{
        agent_signal_entry_type, create_imported_profile, inner_create_whoami, inner_update_whoami,
        AgentSignal, Profile, SignalData,
    };

    #[test]
    fn test_create_whoami() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let wire_record = generate_wire_record();
        let profile = wire_record.clone().entry;
        let profile_entry = CreateInput::try_from(profile.clone()).unwrap();
        let profile_action_hash = wire_record.clone().action_hash;
        mock_create(
            mock_hdk_ref,
            profile_entry,
            Ok(profile_action_hash.clone().into()),
        );

        let profile_hash: EntryHash = wire_record.entry_hash.clone().into();
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(profile.clone()).unwrap(),
            Ok(profile_hash.clone()),
        );

        let agent_path = Path::from("agents");
        let agent_path_hash = fixt!(EntryHash);
        let agent_path_entry = PathEntry::new(agent_path_hash.clone());
        let agent_path_entry_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path).unwrap(),
            Ok(agent_path_hash.clone()),
        );

        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path_entry.clone()).unwrap(),
            Ok(agent_path_entry_hash.clone()),
        );
        let create_link_input = CreateLinkInput::new(
            agent_path_entry_hash.clone(),
            profile_hash.clone(),
            LinkTag::from(()),
            ChainTopOrdering::default(),
        );
        let link_action_hash = fixt!(HeaderHash);
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_action_hash.clone()),
        );

        let time = wire_record.created_at.clone();
        mock_sys_time(mock_hdk_ref, Ok(time));

        let agent_info = fixt!(AgentInfo);
        let agent_entry_hash = EntryHash::from(agent_info.clone().agent_initial_pubkey);
        mock_agent_info(mock_hdk_ref, Ok(agent_info));
        let create_link_input = CreateLinkInput::new(
            agent_entry_hash,
            profile_hash,
            LinkTag::from(()),
            ChainTopOrdering::default(),
        );
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_action_hash.clone()),
        );

        let signal = AgentSignal {
            entry_type: agent_signal_entry_type(),
            action: ActionType::Create,
            data: SignalData::Create(wire_record.clone()),
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
        assert_eq!(result, Ok(wire_record));
    }
    #[test]
    fn test_create_imported_profile() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let wire_record = generate_wire_record();
        let profile = wire_record.clone().entry;
        let profile_entry = CreateInput::try_from(profile.clone()).unwrap();
        let profile_action_hash = wire_record.clone().action_hash;
        let profile_entry_hash = wire_record.clone().entry_hash;

        mock_create(
            mock_hdk_ref,
            profile_entry,
            Ok(profile_action_hash.clone().into()),
        );

        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(profile.clone()).unwrap(),
            Ok(profile_entry_hash.clone().into()),
        );

        let agent_path = Path::from("agents");
        let agent_path_hash = fixt!(EntryHash);
        let agent_path_entry = PathEntry::new(agent_path_hash.clone());
        let agent_path_entry_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path).unwrap(),
            Ok(agent_path_hash.clone()),
        );

        mock_hash_entry(
            mock_hdk_ref,
            Entry::try_from(agent_path_entry.clone()).unwrap(),
            Ok(agent_path_entry_hash.clone()),
        );
        let create_link_input = CreateLinkInput::new(
            agent_path_entry_hash.clone(),
            profile_entry_hash.into(),
            LinkTag::from(()),
            ChainTopOrdering::default(),
        );
        let link_action_hash = fixt!(HeaderHash);
        mock_create_link(
            mock_hdk_ref,
            create_link_input,
            Ok(link_action_hash.clone()),
        );
        let time = wire_record.created_at.clone();
        mock_sys_time(mock_hdk_ref, Ok(time));
        set_hdk(mock_hdk);
        let result = create_imported_profile(profile);
        assert_eq!(result, Ok(wire_record));
    }
    #[test]
    fn test_update_whoami() {
        let mut mock_hdk = MockHdkT::new();
        let mock_hdk_ref = &mut mock_hdk;

        let mut wire_record = generate_wire_record();
        let profile_address = wire_record.action_hash.clone();
        let profile = wire_record.entry.clone();
        let update_input = UpdateInput::new(
            profile_address.clone().into(),
            CreateInput::try_from(profile.clone()).unwrap(),
        );
        let update_action_hash = fixt!(HeaderHash);
        mock_update(mock_hdk_ref, update_input, Ok(update_action_hash));

        let update_entry_hash = fixt!(EntryHash);
        mock_hash_entry(
            mock_hdk_ref,
            CreateInput::try_from(profile.clone()).unwrap().entry,
            Ok(update_entry_hash.clone()),
        );
        let time = wire_record.created_at.clone();
        mock_sys_time(mock_hdk_ref, Ok(time));

        wire_record.entry_hash = EntryHashB64::new(update_entry_hash);

        let signal = AgentSignal {
            entry_type: agent_signal_entry_type(),
            action: ActionType::Update,
            data: SignalData::Update(wire_record.clone()),
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
        let result = inner_update_whoami(
            profiles::profile::UpdateInput {
                action_hash: profile_address,
                entry: profile,
            },
            get_peers,
        );
        assert_eq!(result, Ok(wire_record));
    }
    // #[test]
    // fn test_whoami() {}
    // #[test]
    // fn test_fetch_agents() {}

    /// generate an arbitrary `WireEntry` for unit testing
    fn generate_wire_record() -> WireRecord<Profile> {
        let profile = fixt!(Profile);
        let profile_action_hash = fixt!(HeaderHash);
        let profile_entry_hash = fixt!(EntryHash);
        let date_time: chrono::DateTime<chrono::Utc> = chrono::offset::Utc::now();
        let time = Timestamp::from(date_time);
        let wire_record = WireRecord {
            entry: profile,
            action_hash: ActionHashB64::new(profile_action_hash),
            entry_hash: EntryHashB64::new(profile_entry_hash),
            created_at: time,
            updated_at: time,
        };
        wire_record
    }
}
