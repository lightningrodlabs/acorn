export const PROFILES_ZOME_NAME = 'acorn_profiles'
export const PROJECTS_ZOME_NAME = 'acorn_projects'

export const PROFILES_DNA_NAME = 'profiles.dna.gz'

// THIS IS DEFINED IN holochain-run-dna
// lib in use by acorn-hc
export const PROFILES_APP_ID = __APP_NAME__

console.log('PROFILES_APP_ID: ', PROFILES_APP_ID)

export const PROJECTS_DNA_PATH =
  process.env.NODE_ENV === 'production'
    ? './dna/projects.dna.gz'
    : './dnas/projects/projects.dna.gz'

console.log('PROJECTS_DNA_PATH: ', PROJECTS_DNA_PATH)
