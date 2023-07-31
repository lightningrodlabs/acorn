import { CellId } from '@holochain/client'
import ProfilesZomeApi from '../src/api/profilesApi'
import { ProjectExportDataV1 } from '../src/migrating/export'
import {
  internalImportProjectsData,
  internalInstallProjectAppAndImport,
} from '../src/migrating/import'
import { Action, AgentPubKeyB64, CellIdString } from '../src/types/shared'
import { sampleGoodDataExport } from './sample-good-data-export'
import ProjectsZomeApi from '../src/api/projectsApi'
import { ProjectMeta } from '../src/types'
import { WireRecord } from '../src/api/hdkCrud'
import mockProjectMeta from './mockProjectMeta'
import mockWhoami from './mockWhoami'
import mockBaseRootState from './mockBaseRootState'

let store: any
let getAppWs: any
let createProfilesZomeApi: (appWebsocket: any) => ProfilesZomeApi
let createProjectsZomeApi: (appWebsocket: any) => ProjectsZomeApi
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

let importProjectData: (
  projectData: ProjectExportDataV1,
  projectsCellIdString: CellIdString,
  dispatch: any
) => Promise<{ [oldActionHash: string]: string }>

let simpleCreateProjectMeta: (
  cellId: CellIdString,
  payload: WireRecord<ProjectMeta>
) => Action<WireRecord<ProjectMeta>>

let onStep: (completed: number, toComplete: number) => void

let whoami: any
let baseRootState: any
let mockGetState: any
let mockCellIdString: string
let mockAppWs: any
let projectMeta: any

let mockMigrationData: any

beforeEach(() => {
  mockAppWs = {}
  getAppWs = jest.fn().mockResolvedValue(mockAppWs)

  createProfilesZomeApi = jest.fn().mockReturnValue({
    profile: {
      // turn this jest.fn into a var that you can track and assert on
      createWhoami: jest.fn(),
    },
  })
  projectMeta = mockProjectMeta
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

  whoami = mockWhoami

  baseRootState = mockBaseRootState

  mockMigrationData = JSON.stringify(sampleGoodDataExport)

  mockGetState = jest.fn().mockReturnValue(baseRootState)

  store = {
    dispatch: jest.fn(),
    getState: mockGetState,
  }
})

describe('importProjectsData()', () => {
  // if you want a quick way to get at the type expressed in the signature
  // of a function you can use something similar to: ReturnType<typeof ProfilesApi>
  // aah nice, whats the ReturnType<> for?
  // it means if this is a function, what type does it return, e.g. Promise<SomeType>
  // gotcha. nice!

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
  it('does something else', async () => {
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
      mockProjectMeta
    )
  })
})
