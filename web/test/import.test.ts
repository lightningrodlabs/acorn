// appWs needs a callZome() method
/* fields needed on profilesApi:
 * createWhoami
 * createImportedProfile
 * updateWhoami
 * whoami
 * fetchAgents
 * fetchAgentAddress
 */

import ProfilesZomeApi from '../src/api/profilesApi'
import { ProjectExportDataV1 } from '../src/migrating/export'
import { internalImportProjectsData } from '../src/migrating/import'
import { AgentPubKeyB64 } from '../src/types/shared'

describe('importProjectsData()', () => {
  let store: any
  let getAppWs: () => Promise<any>
  let createProfilesZomeApi: (appWebsocket: any) => ProfilesZomeApi
  let installProjectAppAndImport: (
    agentAddress: AgentPubKeyB64,
    projectData: ProjectExportDataV1,
    passphrase: string,
    dispatch: any
  ) => Promise<void>
  let migrationData: string
  let onStep: (completed: number, toComplete: number) => void

  beforeEach(() => {})
  it('should do something', () => {
    internalImportProjectsData(
      getAppWs,
      createProfilesZomeApi,
      installProjectAppAndImport,
      store,
      migrationData,
      onStep
    )
  })
})
