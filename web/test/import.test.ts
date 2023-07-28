// appWs needs a callZome() method
/* fields needed on profilesApi:
 * createWhoami
 * createImportedProfile
 * updateWhoami
 * whoami
 * fetchAgents
 * fetchAgentAddress
 */

import { CellId } from '@holochain/client'
import ProfilesZomeApi from '../src/api/profilesApi'
import { ProjectExportDataV1 } from '../src/migrating/export'
import { internalImportProjectsData } from '../src/migrating/import'
import testAgent from '../src/stories/testData/testAgent'
import { AgentPubKeyB64, CellIdString } from '../src/types/shared'
import { sampleGoodDataExport } from './sample-good-data-export'

describe('importProjectsData()', () => {
  let store: any
  let getAppWs: any
  let createProfilesZomeApi: (appWebsocket: any) => ProfilesZomeApi
  // let createWhoAmI: typeof ProfilesApi
  let installProjectAppAndImport: (
    agentAddress: AgentPubKeyB64,
    projectData: ProjectExportDataV1,
    passphrase: string,
    dispatch: any
  ) => Promise<void>
  let installProjectApp: (
    passphrase: string
  ) => Promise<[CellIdString, CellId, string]>
  let onStep: (completed: number, toComplete: number) => void

  let whoami: any
  let mockBaseRootState: any
  let mockGetState: any

  let mockMigrationData: any

  // if you want a quick way to get at the type expressed in the signature
  // of a function you can use something similar to: ReturnType<typeof ProfilesApi>
  // aah nice, whats the ReturnType<> for?
  // it means if this is a function, what type does it return, e.g. Promise<SomeType>
  // gotcha. nice!

  beforeEach(() => {
    getAppWs = jest.fn().mockResolvedValue({})
    createProfilesZomeApi = jest.fn().mockReturnValue({
      profile: {
        // turn this jest.fn into a var that you can track and assert on
        createWhoami: jest.fn(),
      },
    })
    installProjectAppAndImport = jest.fn()
    installProjectApp = jest
      .fn()
      .mockResolvedValue(['testCellIdString', ['abc'], 'testString'])
    onStep = jest.fn()
    whoami = {
      actionHash: 'testActionHash',
      entryHash: 'testEntryHash',
      createdAt: 1234, // nanoseconds
      updatedAt: 1234, // nanoseconds
      entry: {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        handle: 'testHandle',
        status: 'Online',
        avatarUrl: 'testAvatarUrl',
        agentPubKey: 'testAgentPubKey',
        isImported: false,
      },
    }
    mockBaseRootState = {
      whoami,
      cells: {
        profiles:
          '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1',
        projects: [
          '132,45,36,67,75,209,140,160,204,62,71,45,229,66,99,63,6,255,250,52,234,238,45,50,174,198,118,29,208,28,207,156,147,252,58,99,131,165,51[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1',
        ],
      },
      agentAddress: 'testAgentAddress',
    }
    mockMigrationData = JSON.stringify(sampleGoodDataExport)

    mockGetState = jest.fn().mockReturnValue(mockBaseRootState)

    store = {
      dispatch: jest.fn(),
      getState: mockGetState,
    }
  })

  it('should do something', async () => {
    await internalImportProjectsData(
      getAppWs,
      createProfilesZomeApi,
      installProjectAppAndImport,
      installProjectApp,
      store,
      mockMigrationData,
      onStep
    )

    expect(getAppWs).toHaveBeenCalledTimes(1)

    expect(createProfilesZomeApi).toHaveBeenCalledTimes(1)
    expect(createProfilesZomeApi).toHaveBeenCalledWith({})

    expect(installProjectAppAndImport).toHaveBeenCalledTimes(1)
    expect(installProjectAppAndImport).toHaveBeenCalledWith(
      'testAgentAddress',
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch
    )

    expect(installProjectApp).toHaveBeenCalledTimes(1)
    expect(installProjectApp).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[1].projectMeta.passphrase
    )

    expect(store.dispatch).toHaveBeenCalled()
    expect(store.getState).toHaveBeenCalledTimes(1)

    expect(onStep).toHaveBeenCalledTimes(
      1 + sampleGoodDataExport.projects.length
    )
  })
})
