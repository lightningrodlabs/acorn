import importProjectsData, {
  internalImportProjectsData,
} from '../src/migrating/import/import'
import { sampleGoodDataExport } from './sample-good-data-export'
import {
  Connection,
  Outcome,
  OutcomeMember,
  ProjectMeta,
  Tag,
} from '../src/types'
import { WireRecord } from '../src/api/hdkCrud'
import mockUnmigratedProjectMeta from './mockProjectMeta'
import mockBaseRootState from './mockRootState'
import { installProject as iInstallProject } from '../src/projects/installProject'
import { getAppWs as iGetAppWs } from '../src/hcWebsockets'
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
import {
  createProfilesZomeApi as iCreateProfilesZomeApi,
  createProjectsZomeApi as iCreateProjectsZomeApi,
} from '../src/migrating/import/zomeApiCreators'
import {
  cloneDataSet as iCloneDataSet,
  cloneConnection as iCloneConnection,
  cloneOutcome as iCloneOutcome,
  cloneTag as iCloneTag,
  cloneData as iCloneData,
  cloneProjectMeta as iCloneProjectMeta,
  ActionHashMap,
} from '../src/migrating/import/cloneFunctions'
import {
  createActionHashMapAndImportProjectData as iCreateActionHashMapAndImportProjectData,
  internalCreateActionHashMapAndImportProjectData,
} from '../src/migrating/import/createActionHashMapAndImportProjectData'
import {
  installProjectAndImport as iInstallProjectAndImport,
  internalInstallProjectAndImport,
} from '../src/migrating/import/installProjectAndImport'
import mockWhoami from './mockWhoami'
import { cellIdFromString } from '../src/utils'
import mockActionHashMaps from './mockActionHashMaps'
import { WithActionHash } from '../src/types/shared'
import { ZodError } from 'zod'
import { finalizeCreateProject as iFinalizeCreateProject } from '../src/projects/createProject'

let store: any // too complex of a type to mock

let createProfilesZomeApi: typeof iCreateProfilesZomeApi
let createProjectsZomeApi: typeof iCreateProjectsZomeApi
let profilesZomeApi: ProfilesZomeApi
let projectsZomeApi: ProjectsZomeApi
let installProjectAndImport: typeof iInstallProjectAndImport
let installProject: typeof iInstallProject
let finalizeCreateProject: typeof iFinalizeCreateProject
let createActionHashMapAndImportProjectData: typeof iCreateActionHashMapAndImportProjectData
let baseRootState: typeof mockBaseRootState
let mockGetState: () => RootState
let cloneDataSet: typeof iCloneDataSet
let onStep: Parameters<typeof importProjectsData>[2]
let mockAppWs: AppWebsocket
let projectMeta: WireRecord<ProjectMeta>
let mockMigrationData: string
let mockCellIdString: string
let createWhoami: typeof ProfilesZomeApi.prototype.profile.createWhoami
let cloneTag: typeof iCloneTag

const createTag = jest.fn().mockResolvedValue(mockTag)
const createOutcome = jest.fn().mockResolvedValue(mockOutcome)
const createConnection = jest.fn().mockResolvedValue(mockConnection)
const createOutcomeMember = jest.fn().mockResolvedValue(mockOutcomeMember)
const createOutcomeComment = jest.fn().mockResolvedValue(mockOutcomeComment)
const createEntryPoint = jest.fn().mockResolvedValue(mockEntryPoint)

beforeEach(() => {
  createWhoami = jest.fn().mockResolvedValue(mockWhoami)
  cloneDataSet = jest
    .fn()
    .mockReturnValueOnce(mockActionHashMaps.tagActionHashMap)
    .mockReturnValueOnce(mockActionHashMaps.outcomeActionHashMap)
    .mockReturnValueOnce(mockActionHashMaps.connectionsActionHashMap)
    .mockReturnValueOnce(mockActionHashMaps.outcomeMembersActionHashMap)
    .mockReturnValueOnce(mockActionHashMaps.outcomeCommentActionHashMap)
    .mockReturnValueOnce(mockActionHashMaps.entryPointActionHashMap)
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
  profilesZomeApi = createProfilesZomeApi(mockAppWs)
  projectsZomeApi = createProjectsZomeApi(mockAppWs)
  installProjectAndImport = jest.fn()
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  installProject = jest
    .fn()
    .mockResolvedValue([mockCellIdString, ['abc'], 'testString'])

  finalizeCreateProject = jest.fn()

  createActionHashMapAndImportProjectData = jest.fn().mockResolvedValue({
    tagActionHashMap: {},
    outcomeActionHashMap: {},
    connectionsActionHashMap: {},
    outcomeMembersActionHashMap: {},
    outcomeCommentActionHashMap: {},
    entryPointActionHashMap: {},
  })

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
      profilesZomeApi,
      installProjectAndImport,
      installProject,
      store,
      mockMigrationData,
      onStep
    )

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

    expect(installProjectAndImport).toHaveBeenCalledTimes(1)
    expect(installProjectAndImport).toHaveBeenCalledWith(
      'testAgentAddress',
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch
    )

    expect(installProject).toHaveBeenCalledTimes(1)
    expect(installProject).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[1].projectMeta.passphrase
    )

    expect(createWhoami).toHaveBeenCalledTimes(1)
    expect(createWhoami).toHaveBeenCalledWith(
      cellIdFromString(baseRootState.cells.profiles),
      sampleGoodDataExport.myProfile
    )

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'CREATE_WHOAMI',
      payload: mockWhoami,
      meta: { cellIdString: mockCellIdString },
    })
    expect(store.dispatch).toHaveBeenLastCalledWith({
      type: 'JOIN_PROJECT_CELL_ID',
      payload: mockCellIdString,
    })

    expect(store.getState).toHaveBeenCalledTimes(1)

    expect(onStep).toHaveBeenCalledTimes(
      1 + sampleGoodDataExport.projects.length
    )
  })

  it('throws error with invalid json', async () => {
    mockMigrationData = 'invalid json'
    try {
      await internalImportProjectsData(
        profilesZomeApi,
        installProjectAndImport,
        installProject,
        store,
        mockMigrationData,
        onStep
      )
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError)
      expect(e.errors[0].message).toBe('Invalid JSON')
    }

    mockMigrationData = null
    try {
      await internalImportProjectsData(
        profilesZomeApi,
        installProjectAndImport,
        installProject,
        store,
        mockMigrationData,
        onStep
      )
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError)
      expect(e.errors[0].message).toBe('Expected string, received null')
    }

    mockMigrationData = '{"foo": "bar"}'
    try {
      await internalImportProjectsData(
        profilesZomeApi,
        installProjectAndImport,
        installProject,
        store,
        mockMigrationData,
        onStep
      )
    } catch (e) {
      expect(e.errors).toEqual([
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'undefined',
          path: ['myProfile'],
          message: 'Required',
        },
        {
          code: 'invalid_type',
          expected: 'array',
          received: 'undefined',
          path: ['projects'],
          message: 'Required',
        },
        {
          code: 'invalid_type',
          expected: 'number',
          received: 'undefined',
          path: ['integrityVersion'],
          message: 'Required',
        },
      ])
    }
  })
})

describe('installProjectAndImport()', () => {
  const agentAddress = 'testAgentAddress'
  it('installs DNA and imports project into new cell', async () => {
    await internalInstallProjectAndImport(
      agentAddress,
      sampleGoodDataExport.projects[0],
      sampleGoodDataExport.projects[0].projectMeta.passphrase,
      store.dispatch,
      installProject,
      createActionHashMapAndImportProjectData,
      finalizeCreateProject,
      projectsZomeApi
    )

    expect(installProject).toHaveBeenCalledTimes(1)
    expect(installProject).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[0].projectMeta.passphrase
    )

    expect(createActionHashMapAndImportProjectData).toHaveBeenCalledTimes(1)
    expect(createActionHashMapAndImportProjectData).toHaveBeenCalledWith(
      sampleGoodDataExport.projects[0],
      mockCellIdString,
      store.dispatch
    )

    expect(finalizeCreateProject).toHaveBeenCalledTimes(1)
    const expectedProjectMeta = {
      creatorAgentPubKey: 'testAgentAddress',
      // use expect.anything() because of Date.now()
      // being used internally
      createdAt: expect.anything(),
      name: 'new project',
      image: '',
      passphrase: 'daily plant employee shorten define',
      isImported: false,
      layeringAlgorithm: 'CoffmanGraham',
      topPriorityOutcomes: [],
      isMigrated: null,
    }
    expect(finalizeCreateProject).toHaveBeenCalledWith(
      mockCellIdString,
      expectedProjectMeta,
      'testAgentAddress',
      store.dispatch,
      projectsZomeApi
    )
  })
})

describe('createActionHashMapAndImportProjectData()', () => {
  it('creates actionHashMaps for all relevant data types', async () => {
    let projectData = sampleGoodDataExport.projects[0]
    projectsZomeApi = createProjectsZomeApi(mockAppWs)

    const result = await internalCreateActionHashMapAndImportProjectData(
      projectData,
      mockCellIdString,
      store.dispatch,
      projectsZomeApi,
      cloneDataSet
    )

    expect(result).toEqual(mockActionHashMaps)

    expect(cloneDataSet).toHaveBeenCalledTimes(6)

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      1,
      projectData.tags,
      expect.anything(), // cloneFn is not passed as a positional arg, so we can't check for it directly
      projectsZomeApi.tag.create,
      dispatchCreateTag,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      2,
      projectData.outcomes,
      expect.anything(),
      projectsZomeApi.outcome.create,
      dispatchCreateOutcome,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      3,
      projectData.connections,
      expect.anything(),
      projectsZomeApi.connection.create,
      dispatchCreateConnection,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      4,
      projectData.outcomeMembers,
      expect.anything(),
      projectsZomeApi.outcomeMember.create,
      dispatchCreateOutcomeMember,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      5,
      projectData.outcomeComments,
      expect.anything(),
      projectsZomeApi.outcomeComment.create,
      dispatchCreateOutcomeComment,
      store.dispatch,
      mockCellIdString
    )

    expect(cloneDataSet).toHaveBeenNthCalledWith(
      6,
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
    const result = await iCloneDataSet<Tag>(
      projectData.tags,
      cloneTag,
      projectsZomeApi.tag.create,
      dispatchCreateTag,
      store.dispatch,
      mockCellIdString
    )

    expect(Object.keys(projectData.tags).length).toBe(1)
    expect(Object.keys(result).length).toBe(1)

    const oldTagActionHash = Object.values<WithActionHash<Tag>>(
      projectData.tags
    )[0].actionHash
    expect(result).toEqual({ [oldTagActionHash]: 'testActionHash' })
  })
})

describe('cloneTag()', () => {
  it('creates a deep copy of the old tag', () => {
    const oldTag = sampleGoodDataExport.projects[0].tags.testTagActionHash
    const result = iCloneTag(oldTag)

    expect(result).toEqual(oldTag)
    expect(result).not.toBe(oldTag)
  })
})

describe('cloneOutcome()', () => {
  it('creates a deep copy of the old outcome', () => {
    const oldOutcome = Object.values<WithActionHash<Outcome>>(
      sampleGoodDataExport.projects[0].outcomes
    )[0]
    const tagActionHashMap = {
      '124': 'testActionHash',
    }
    const result = iCloneOutcome(tagActionHashMap)(oldOutcome)

    expect(result).toEqual({
      ...oldOutcome,
      tags: ['testActionHash'],
      isImported: true,
    })
  })
})

describe('cloneConnection()', () => {
  it('creates a deep copy of the old connection', () => {
    const oldConnection = Object.values<WithActionHash<Connection>>(
      sampleGoodDataExport.projects[0].connections
    )[0]
    const outcome1 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[0]]: Object.values<WithActionHash<Outcome>>(
        sampleGoodDataExport.projects[0].outcomes
      )[0].actionHash,
    }
    const outcome2 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[1]]: Object.values<WithActionHash<Outcome>>(
        sampleGoodDataExport.projects[0].outcomes
      )[1].actionHash,
    }
    const outcomeActionHashMap: ActionHashMap = {
      ...outcome1,
      ...outcome2,
    }
    const result = iCloneConnection(outcomeActionHashMap)(oldConnection)

    expect(result).toEqual({
      ...oldConnection,
      parentActionHash: oldConnection.parentActionHash,
      childActionHash: oldConnection.childActionHash,
      randomizer: Number(oldConnection.randomizer.toFixed()),
      isImported: true,
    })
  })

  it('still clones when given a float randomizer value', () => {
    const oldConnection = {
      ...Object.values<WithActionHash<Connection>>(
        sampleGoodDataExport.projects[0].connections
      )[0],
      randomizer: 0.5,
    }
    const outcome1 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[0]]: Object.values<WithActionHash<Outcome>>(
        sampleGoodDataExport.projects[0].outcomes
      )[0].actionHash,
    }
    const outcome2 = {
      [Object.keys(
        sampleGoodDataExport.projects[0].outcomes
      )[1]]: Object.values<WithActionHash<Outcome>>(
        sampleGoodDataExport.projects[0].outcomes
      )[1].actionHash,
    }
    const outcomeActionHashMap: ActionHashMap = {
      ...outcome1,
      ...outcome2,
    }
    const result = iCloneConnection(outcomeActionHashMap)(oldConnection)

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

    const oldData = Object.values<WithActionHash<OutcomeMember>>(
      sampleGoodDataExport.projects[0].outcomeMembers
    )[0]
    const outcomeActionHashMap: ActionHashMap = {
      [oldData.outcomeActionHash]: Object.values<WithActionHash<Outcome>>(
        sampleGoodDataExport.projects[0].outcomes
      )[2].actionHash,
    }

    const result = iCloneData<OutcomeMember>(outcomeActionHashMap)(oldData)

    expect(result).toEqual({
      ...oldData,
      outcomeActionHash: outcomeActionHashMap[oldData.outcomeActionHash],
      isImported: true,
    })
  })
})

describe('cloneProjectMeta()', () => {
  it('creates a deep copy of the old project meta', () => {
    const oldData = { ...sampleGoodDataExport.projects[0].projectMeta }
    const outcomeActionHashMap: ActionHashMap = {
      oldActionHash: 'newActionHash',
    }

    const result = iCloneProjectMeta(
      outcomeActionHashMap,
      oldData.creatorAgentPubKey,
      oldData.passphrase
    )(oldData)

    expect(result.topPriorityOutcomes).toEqual(['newActionHash'])
    expect(result.layeringAlgorithm).toEqual(oldData['layeringAlgorithm'])
    expect(result.createdAt).not.toEqual(oldData.createdAt)
  })

  it('when topPriorityOutcomes and layeringAlgorithm are missing, it adds default values', () => {
    const oldData = { ...sampleGoodDataExport.projects[0].projectMeta }
    const outcomeActionHashMap: ActionHashMap = {
      oldActionHash: 'newActionHash',
    }
    delete oldData['topPriorityOutcomes']
    delete oldData['layeringAlgorithm']

    const result = iCloneProjectMeta(
      outcomeActionHashMap,
      oldData.creatorAgentPubKey,
      oldData.passphrase
    )(oldData)

    expect(result.topPriorityOutcomes).toEqual([])
    expect(result.layeringAlgorithm).toEqual('LongestPath')
  })
})
