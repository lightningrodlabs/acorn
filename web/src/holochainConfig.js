// this corresponds with the zome name used in
// `dna/workdir/dna/profiles/dna.yaml`
export const PROFILES_ZOME_NAME = 'profiles'

// this corresponds with the zome name used in
// `dna/workdir/dna/projects/dna.yaml`
export const PROJECTS_ZOME_NAME = 'projects'

// this corresponds with the app id used to install the app
// defined in for the web clients in `config-main-app-id`
// and for the "server" in `electron/src/holochain.ts`
// @ts-ignore
export const MAIN_APP_ID = __MAIN_APP_ID__

// this corresponds with the `id` field of the profiles slot
// defined in `conductor/src/main.rs`
export const PROFILES_ROLE_ID = 'profiles-role'

// is used as a prefix for the creation of new Project apps/DHTs
export const PROJECT_APP_PREFIX = 'acorn-project'
