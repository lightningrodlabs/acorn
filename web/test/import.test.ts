import importProjectsData, {
  installProjectAppAndImport as _installProjectAppAndImport,
  importProjectData as _importProjectData,
  internalImportProjectsData,
  internalInstallProjectAppAndImport,
  createProfilesZomeApi as _createProfilesZomeApi,
  createProjectsZomeApi as _createProjectsZomeApi,
  internalImportProjectData,
  cloneDataSet as _cloneDataSet,
  cloneTag as _cloneTag,
  cloneOutcome as _cloneOutcome,
  cloneConnection as _cloneConnection,
  cloneData as _cloneData,
  ActionHashMap,
} from '../src/migrating/import/import'
import { sampleGoodDataExport } from './sample-good-data-export'
import { OutcomeMember, ProjectMeta, Tag } from '../src/types'
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
import { createTag as dispatchCreateTag } from '../src/redux/persistent/projects/tags/actions'
import { createOutcome as dispatchCreateOutcome } from '../src/redux/persistent/projects/outcomes/actions'
import { createConnection as dispatchCreateConnection } from '../src/redux/persistent/projects/connections/actions'
import { createOutcomeMember as dispatchCreateOutcomeMember } from '../src/redux/persistent/projects/outcome-members/actions'
import { createOutcomeComment as dispatchCreateOutcomeComment } from '../src/redux/persistent/projects/outcome-comments/actions'
import { createEntryPoint as dispatchCreateEntryPoint } from '../src/redux/persistent/projects/entry-points/actions'

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
let cloneDataSet: typeof _cloneDataSet
let onStep: Parameters<typeof importProjectsData>[2]
let mockAppWs: AppWebsocket
let projectMeta: WireRecord<ProjectMeta>
let mockMigrationData: string
let mockCellIdString: string
let createWhoami: typeof ProfilesZomeApi.prototype.profile.createWhoami
let cloneTag: typeof _cloneTag

const createTag = jest.fn().mockResolvedValue(mockTag)
const createOutcome = jest.fn().mockResolvedValue(mockOutcome)
const createConnection = jest.fn().mockResolvedValue(mockConnection)
const createOutcomeMember = jest.fn().mockResolvedValue(mockOutcomeMember)
const createOutcomeComment = jest.fn().mockResolvedValue(mockOutcomeComment)
const createEntryPoint = jest.fn().mockResolvedValue(mockEntryPoint)

beforeEach(() => {
  mockAppWs = {} as typeof mockAppWs
  getAppWs = jest.fn().mockResolvedValue(mockAppWs)
  createWhoami = jest.fn()
  cloneDataSet = jest.fn()
  cloneTag = jest.fn().mockReturnValue({ ...mockTag })

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
  it('creates actionHashMaps for all relevant data types', async () => {
    let projectData = sampleGoodDataExport.projects[0]
    projectsZomeApi = createProjectsZomeApi(mockAppWs)

    await internalImportProjectData(
      projectData,
      mockCellIdString,
      store.dispatch,
      getAppWs,
      createProjectsZomeApi,
      cloneDataSet
    )

    expect(cloneDataSet).toHaveBeenCalledTimes(6)

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.tags,
      expect.anything(), // cloneFn is not passed as a positional arg, so we can't check for it directly
      projectsZomeApi.tag.create,
      dispatchCreateTag,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.outcomes,
      expect.anything(),
      projectsZomeApi.outcome.create,
      dispatchCreateOutcome,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.connections,
      expect.anything(),
      projectsZomeApi.connection.create,
      dispatchCreateConnection,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.outcomeMembers,
      expect.anything(),
      projectsZomeApi.outcomeMember.create,
      dispatchCreateOutcomeMember,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.outcomeComments,
      expect.anything(),
      projectsZomeApi.outcomeComment.create,
      dispatchCreateOutcomeComment,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenCalledWith(
      projectData.entryPoints,
      expect.anything(),
      projectsZomeApi.entryPoint.create,
      dispatchCreateEntryPoint,
      store.dispatch,
      mockCellIdString
    )
  })
})

describe('cloneDataSet()', () => {
  it('returns a new actionHashMap with old actionHash as the key and new one as the value', async () => {
    const projectData = sampleGoodDataExport.projects[0]
    const result = await _cloneDataSet<Tag>(
      projectData.tags,
      cloneTag,
      projectsZomeApi.tag.create,
      dispatchCreateTag,
      store.dispatch,
      mockCellIdString
    )

    expect(Object.keys(projectData.tags).length).toBe(1)
    expect(Object.keys(result).length).toBe(1)

    const oldTagActionHash = Object.values(projectData.tags)[0].actionHash
    expect(result).toEqual({ [oldTagActionHash]: 'testActionHash' })
  })
})

describe('cloneTag()', () => {
  it('creates a deep copy of the old tag', () => {
    const oldTag = sampleGoodDataExport.projects[0].tags.testTagActionHash
    const result = _cloneTag(oldTag)

    expect(result).toEqual(oldTag)
    expect(result).not.toBe(oldTag)
  })
})

describe('cloneOutcome()', () => {
  it('creates a deep copy of the old outcome', () => {
    const oldOutcome = Object.values(
      sampleGoodDataExport.projects[0].outcomes
    )[0]
    const tagActionHashMap = {
      [sampleGoodDataExport.projects[0].tags.testTagActionHash.actionHash]:
        'testActionHash',
    }
    const result = _cloneOutcome(tagActionHashMap)(oldOutcome)

    expect(result).toEqual({
      ...oldOutcome,
      tags: ['testActionHash'],
      isImported: true,
    })
  })
})

describe('cloneConnection()', () => {
  it('creates a deep copy of the old connection', () => {
    const oldConnection = Object.values(
      sampleGoodDataExport.projects[0].connections
    )[0]
    const outcome1 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[0]]: Object.values(sampleGoodDataExport.projects[0].outcomes)[0]
        .actionHash,
    }
    const outcome2 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[1]]: Object.values(sampleGoodDataExport.projects[0].outcomes)[1]
        .actionHash,
    }
    const outcomeActionHashMap: ActionHashMap = {
      ...outcome1,
      ...outcome2,
    }
    const result = _cloneConnection(outcomeActionHashMap)(oldConnection)

    expect(result).toEqual({
      ...oldConnection,
      parentActionHash: oldConnection.parentActionHash,
      childActionHash: oldConnection.childActionHash,
      randomizer: Number(oldConnection.randomizer.toFixed()),
      isImported: true,
    })
  })
})
describe('cloneData()', () => {
  it('creates a deep copy of the old data', () => {
    // using outcome member as a generic example

    const oldData = Object.values(
      sampleGoodDataExport.projects[0].outcomeMembers
    )[0]
    const outcomeActionHashMap: ActionHashMap = {
      [oldData.outcomeActionHash]: Object.values(
        sampleGoodDataExport.projects[0].outcomes
      )[2].actionHash,
    }

    const result = _cloneData<OutcomeMember>(outcomeActionHashMap)(oldData)

    expect(result).toEqual({
      ...oldData,
      outcomeActionHash: outcomeActionHashMap[oldData.outcomeActionHash],
      isImported: true,
    })
  })
})
