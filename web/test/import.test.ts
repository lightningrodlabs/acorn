import importProjectsData, {
  installProjectAppAndImport as _installProjectAppAndImport,
  importProjectData as _importProjectData,
  internalImportProjectsData,
  internalInstallProjectAppAndImport,
  createProfilesZomeApi as _createProfilesZomeApi,
  createProjectsZomeApi as _createProjectsZomeApi,
  internalImportProjectData,
} from '../src/migrating/import'
import { sampleGoodDataExport } from './sample-good-data-export'
import { ProjectMeta } from '../src/types'
import { WireRecord } from '../src/api/hdkCrud'
import mockUnmigratedProjectMeta from './mockProjectMeta'
import mockBaseRootState from './mockRootState'
import { installProjectApp as _installProjectApp } from '../src/projects/installProjectApp'
import { getAppWs as _getAppWs } from '../src/hcWebsockets'
import { AppWebsocket } from '@holochain/client'
import { RootState } from '../src/redux/reducer'
import ProfilesZomeApi from '../src/api/profilesApi'
import ProjectsZomeApi from '../src/api/projectsApi'
import mockOutcome from './mockOutcome'
import mockConnection from './mockConnection'
import mockTag from './mockTag'
import mockOutcomeMember from './mockOutcomeMember'
import mockOutcomeComment from './mockOutcomeComment'
import mockEntryPoint from './mockEntryPoint'

let store: any // too complex of a type to mock

let getAppWs: typeof _getAppWs
let createProfilesZomeApi: typeof _createProfilesZomeApi
let createProjectsZomeApi: typeof _createProjectsZomeApi
let projectsZomeApi: ProjectsZomeApi
let installProjectAppAndImport: typeof _installProjectAppAndImport
let installProjectApp: typeof _installProjectApp
let importProjectData: typeof _importProjectData
let baseRootState: typeof mockBaseRootState
let mockGetState: () => RootState

let onStep: Parameters<typeof importProjectsData>[2]
let mockAppWs: AppWebsocket
let projectMeta: WireRecord<ProjectMeta>
let mockMigrationData: string
let mockCellIdString: string
let createWhoami: typeof ProfilesZomeApi.prototype.profile.createWhoami

beforeEach(() => {
  mockAppWs = {} as typeof mockAppWs
  getAppWs = jest.fn().mockResolvedValue(mockAppWs)
  createWhoami = jest.fn()

  createProfilesZomeApi = jest.fn().mockReturnValue({
    profile: {
      createWhoami,
    },
  })
  projectMeta = mockUnmigratedProjectMeta
  createProjectsZomeApi = jest.fn().mockReturnValue({
    projectMeta: {
      simpleCreateProjectMeta: jest.fn().mockResolvedValue(projectMeta),
    },
  })
  projectsZomeApi = createProjectsZomeApi(mockAppWs)
  installProjectAppAndImport = jest.fn()
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  installProjectApp = jest
    .fn()
    .mockResolvedValue([mockCellIdString, ['abc'], 'testString'])

  importProjectData = jest.fn()

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
  it('successfully parses and imports project data and user profile', async () => {
    await internalImportProjectsData(
      getAppWs,
      createProfilesZomeApi,
      createProjectsZomeApi,
      installProjectAppAndImport,
      installProjectApp,
      store,
      mockMigrationData,
      onStep
    )

    expect(getAppWs).toHaveBeenCalledTimes(1)

    expect(createProfilesZomeApi).toHaveBeenCalledTimes(1)
    expect(createProfilesZomeApi).toHaveBeenCalledWith(mockAppWs)

    // make sure the test data is actually set up the way the test
    // expects it to be
    expect(sampleGoodDataExport.projects.length).toBe(2)

    // we expect the first project to need to be migrated (isMigrated === null)
    // and the 2nd project to not need to be migrated (isMigrated !== null), only joined
    expect(sampleGoodDataExport.projects[0].projectMeta.isMigrated).toBeNull()
    expect(
      // TODO: this expectation may be incomplete. It's possible that
      // isMigrated is not null, but is also not the same as the current version.
      sampleGoodDataExport.projects[1].projectMeta.isMigrated
    ).not.toBeNull()

    expect(installProjectAppAndImport).toHaveBeenCalledTimes(1)
    expect(installProjectAppAndImport).toHaveBeenCalledWith(
      'testAgentAddress',
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch,
      projectsZomeApi
    )

    expect(installProjectApp).toHaveBeenCalledTimes(1)
    expect(installProjectApp).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[1].projectMeta.passphrase
    )

    expect(createWhoami).toHaveBeenCalledTimes(1)

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
        createProjectsZomeApi,
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
        createProjectsZomeApi,
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
  it('installs DNA and imports project into new cell', async () => {
    await internalInstallProjectAppAndImport(
      agentAddress,
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch,
      installProjectApp,
      importProjectData,
      createProjectsZomeApi,
      projectsZomeApi
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
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'SIMPLE_CREATE_PROJECT_META',
      payload: projectMeta,
      meta: { cellIdString: mockCellIdString },
    })
  })
})

describe('importProjectData()', () => {
  const createTag = jest.fn().mockResolvedValue(mockTag)
  const createOutcome = jest.fn().mockResolvedValue(mockOutcome)
  const createConnection = jest.fn().mockResolvedValue(mockConnection)
  const createOutcomeMember = jest.fn().mockResolvedValue(mockOutcomeMember)
  const createOutcomeComment = jest.fn().mockResolvedValue(mockOutcomeComment)
  const createEntryPoint = jest.fn().mockResolvedValue(mockEntryPoint)

  it('does something', async () => {
    createProjectsZomeApi = jest.fn().mockReturnValue({
      tag: {
        create: createTag,
      },
      outcome: {
        create: createOutcome,
      },
      connection: {
        create: createConnection,
      },
      outcomeMember: {
        create: createOutcomeMember,
      },
      outcomeComment: {
        create: createOutcomeComment,
      },
      entryPoint: {
        create: createEntryPoint,
      },
    })

    const result = await internalImportProjectData(
      sampleGoodDataExport.projects[0],
      mockCellIdString,
      store.dispatch,
      getAppWs,
      createProjectsZomeApi,
      jest.fn() // TODO: replace with cloneDataSet()
    )
    console.log(result)
    const project = sampleGoodDataExport.projects[0]

    expect(createTag).toHaveBeenCalledTimes(Object.keys(project.tags).length)
    expect(createOutcome).toHaveBeenCalledTimes(
      Object.keys(project.outcomes).length
    )
    expect(createConnection).toHaveBeenCalledTimes(
      Object.keys(project.connections).length
    )
    expect(createOutcomeMember).toHaveBeenCalledTimes(
      Object.keys(project.outcomeMembers).length
    )
    expect(createOutcomeComment).toHaveBeenCalledTimes(
      Object.keys(project.outcomeComments).length
    )
    expect(createEntryPoint).toHaveBeenCalledTimes(
      Object.keys(project.entryPoints).length
    )
  })
})
