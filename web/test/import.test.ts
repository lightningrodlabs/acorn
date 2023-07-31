import importProjectsData, {
  installProjectAppAndImport as _installProjectAppAndImport,
  importProjectData as _importProjectData,
  internalImportProjectsData,
  internalInstallProjectAppAndImport,
  createProfilesZomeApi as _createProfilesZomeApi,
  createProjectsZomeApi as _createProjectsZomeApi,
} from '../src/migrating/import'
import { sampleGoodDataExport } from './sample-good-data-export'
import { ProjectMeta } from '../src/types'
import { WireRecord } from '../src/api/hdkCrud'
import mockUnmigratedProjectMeta from './mockProjectMeta'
import mockBaseRootState from './mockBaseRootState'
import { installProjectApp as _installProjectApp } from '../src/projects/installProjectApp'
import { simpleCreateProjectMeta as _simpleCreateProjectMeta } from '../src/redux/persistent/projects/project-meta/actions'
import { getAppWs as _getAppWs } from '../src/hcWebsockets'

let store: any // too complex of a type to mock

let getAppWs: typeof _getAppWs
let createProfilesZomeApi: typeof _createProfilesZomeApi
let createProjectsZomeApi: typeof _createProjectsZomeApi
let installProjectAppAndImport: typeof _installProjectAppAndImport
let installProjectApp: typeof _installProjectApp
let importProjectData: typeof _importProjectData
let simpleCreateProjectMeta: typeof _simpleCreateProjectMeta
let baseRootState: typeof mockBaseRootState
let mockGetState: typeof store.getState

let onStep: Parameters<typeof importProjectsData>[2]
let mockAppWs: ReturnType<typeof getAppWs>
let projectMeta: WireRecord<ProjectMeta>
let mockMigrationData: string
let mockCellIdString: string

beforeEach(() => {
  mockAppWs = {} as typeof mockAppWs
  getAppWs = jest.fn().mockResolvedValue(mockAppWs)

  createProfilesZomeApi = jest.fn().mockReturnValue({
    profile: {
      // turn this jest.fn into a var that you can track and assert on
      createWhoami: jest.fn(),
    },
  })
  projectMeta = mockUnmigratedProjectMeta
  createProjectsZomeApi = jest.fn().mockReturnValue({
    projectMeta: {
      simpleCreateProjectMeta: jest.fn().mockResolvedValue(projectMeta),
    },
  })
  installProjectAppAndImport = jest.fn()
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  installProjectApp = jest
    .fn()
    .mockResolvedValue([mockCellIdString, ['abc'], 'testString'])

  importProjectData = jest.fn()
  simpleCreateProjectMeta = jest.fn()

  onStep = jest.fn()

  baseRootState = mockBaseRootState

  mockMigrationData = JSON.stringify(sampleGoodDataExport)

  mockGetState = jest.fn().mockReturnValue(baseRootState)

  store = {
    dispatch: jest.fn(),
    getState: mockGetState,
  }
})

describe('importProjectsData()', () => {
  it('correctly calls functions with expected arguments', async () => {
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

    // make sure the test data is actually set up the way the test
    // expects it to be
    expect(sampleGoodDataExport.projects.length).toBe(2)
    expect(sampleGoodDataExport.projects[0].projectMeta.isMigrated).toBeNull()
    expect(
      sampleGoodDataExport.projects[1].projectMeta.isMigrated
    ).not.toBeNull()

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

  it('throws error with invalid json', async () => {
    mockMigrationData = 'invalid json'
    try {
      await internalImportProjectsData(
        getAppWs,
        createProfilesZomeApi,
        installProjectAppAndImport,
        installProjectApp,
        store,
        mockMigrationData,
        onStep
      )
    } catch (e) {
      expect(e).toBeInstanceOf(SyntaxError)
      expect(e.message).toBe('Unexpected token i in JSON at position 0')
    }

    mockMigrationData = null
    try {
      await internalImportProjectsData(
        getAppWs,
        createProfilesZomeApi,
        installProjectAppAndImport,
        installProjectApp,
        store,
        mockMigrationData,
        onStep
      )
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError)
      expect(e.message).toBe(
        "Cannot read properties of null (reading 'projects')"
      )
    }
  })
})

describe('installProjectAppAndImport()', () => {
  const agentAddress = 'testAgentAddress'
  it('correctly calls functions with expected arguments', async () => {
    await internalInstallProjectAppAndImport(
      agentAddress,
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch,
      installProjectApp,
      importProjectData,
      getAppWs,
      createProjectsZomeApi,
      simpleCreateProjectMeta
    )

    expect(installProjectApp).toHaveBeenCalledTimes(1)
    expect(installProjectApp).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[0].projectMeta.passphrase
    )

    expect(importProjectData).toHaveBeenCalledTimes(1)
    expect(importProjectData).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[0],
      mockCellIdString,
      store.dispatch
    )

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'SET_MEMBER',
      payload: {
        cellIdString: mockCellIdString,
        member: {
          agentPubKey: 'testAgentAddress',
        },
      },
    })

    expect(getAppWs).toHaveBeenCalledTimes(1)

    expect(createProjectsZomeApi).toHaveBeenCalledTimes(1)
    expect(createProjectsZomeApi).toHaveBeenCalledWith(mockAppWs)

    expect(simpleCreateProjectMeta).toHaveBeenCalledTimes(1)
    expect(simpleCreateProjectMeta).toHaveBeenCalledWith(
      mockCellIdString,
      mockUnmigratedProjectMeta
    )
  })
})
