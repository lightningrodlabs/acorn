use hdk::prelude::*;

// should these be inside a module in this file?
pub fn mock_create(
    mock_hdk: &mut MockHdkT,
    input: EntryWithDefId,
    output: ExternResult<HeaderHash>,
) {
    mock_hdk
        .expect_create()
        .with(mockall::predicate::eq(input))
        .times(1)
        .return_const(output);
}

pub fn mock_hash_entry(mock_hdk: &mut MockHdkT, input: Entry, output: ExternResult<EntryHash>) {
    mock_hdk
        .expect_hash_entry()
        .with(mockall::predicate::eq(input))
        .times(1)
        .return_const(output);
}

pub fn mock_create_link(
    mock_hdk: &mut MockHdkT,
    create_link_input: CreateLinkInput,
    output: ExternResult<HeaderHash>,
) {
    mock_hdk
        .expect_create_link()
        .with(mockall::predicate::eq(create_link_input))
        .times(1)
        .return_const(output);
}

pub fn mock_agent_info(mock_hdk: &mut MockHdkT, output: ExternResult<AgentInfo>) {
    mock_hdk
        .expect_agent_info()
        .times(1)
        .return_const(output);
}

pub fn mock_remote_signal(mock_hdk: &mut MockHdkT, input: RemoteSignal, output: ExternResult<()>) {
    mock_hdk
        .expect_remote_signal()
        .with(mockall::predicate::eq(input))
        .times(1)
        .return_const(output);
}

pub fn mock_update(mock_hdk: &mut MockHdkT, expected_input: UpdateInput, expected_output: ExternResult<HeaderHash>) {
    mock_hdk
        .expect_update()
        .with(mockall::predicate::eq(expected_input))
        .times(1)
        .return_const(expected_output);
}