const entryTypes = [
    "connection",
    "entry_point",
    "outcome",
    "outcome_comment",
    "outcome_member",
    "outcome_vote",
    "tag",
    "project_meta",
]
let crudZomeFunctionNames: [string, string][] = []
for (const entryType of entryTypes) {
    const entryCrudFns: [string, string][] = [
        ["projects", `create_${entryType}`],
        ["projects", `fetch_${entryType}s`],
        ["projects", `update_${entryType}`],
        ["projects", `delete_${entryType}`],

    ]
    crudZomeFunctionNames = [...crudZomeFunctionNames,...entryCrudFns]
}

const profilesZomeFunctions: [string, string][] = [
      ["profiles", "create_whoami"],
      ["profiles", "create_imported_profile"],
      ["profiles", "update_whoami"],
      ["profiles", "whoami"],
      ["profiles", "fetch_agents"],
      ["profiles", "fetch_agent_address"],
      ["profiles", "recv_remote_signal"],
]
const projectsZomeFunctions: [string, string][] = [
      ["projects", "emit_realtime_info_signal"],
      ["projects", "emit_editing_outcome_signal"],
      ["projects", "recv_remote_signal"],
      ["projects", "fetch_entry_point_details"],
      ["projects", "fetch_members"],
      ["projects", "init_signal"],
      ["projects", "create_outcome_with_connection"],
      ["projects", "delete_outcome_fully"],
      ["projects", "simple_create_project_meta"],
      ["projects", "fetch_project_meta"],
      ["projects", "check_project_meta_exists"],
      ...crudZomeFunctionNames
]

export { profilesZomeFunctions, projectsZomeFunctions }