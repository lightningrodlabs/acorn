import { WireRecord } from '../src/api/hdkCrud'
import {
  AllProjectsDataExport,
  ProjectExportDataV1,
  internalExportProjectsData,
} from '../src/migrating/export'
import { LayeringAlgorithm, Profile } from '../src/types'

describe('test export functionality', () => {
  let whoami: WireRecord<Profile>
  let mockProjectData: ProjectExportDataV1

  beforeEach(() => {
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

    mockProjectData = {
      projectMeta: {
        creatorAgentPubKey: 'testAgentPubKey',
        createdAt: 1234,
        name: 'testProjectName',
        image: 'testProjectImage',
        passphrase: 'testPassphrase',
        isImported: false,
        layeringAlgorithm: LayeringAlgorithm.CoffmanGraham,
        topPriorityOutcomes: [],
        isMigrated: null,
        actionHash: 'testProjectActionHash',
      },
      outcomes: {},
      connections: {},
      outcomeMembers: {},
      outcomeComments: {},
      entryPoints: {},
      tags: {},
    }
  })

  it('should return projects data', async () => {
    const constructProjectDataFetchers = jest.fn().mockReturnValue({
      fetchProjectMeta: jest.fn(),
      fetchEntryPoints: jest.fn(),
      fetchOutcomeComments: jest.fn(),
      fetchOutcomeMembers: jest.fn(),
      fetchTags: jest.fn(),
      fetchOutcomes: jest.fn(),
      fetchConnections: jest.fn(),
    })

    const updateProjectMeta = jest.fn()

    const collectExportProjectData = jest.fn().mockReturnValue(mockProjectData)

    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({
        whoami,
        cells: { profiles: null, projects: ['testProjectCellId'] },
      }),
    }

    const toVersion = 'test'
    const onStep = jest.fn()

    const result: AllProjectsDataExport = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      store,
      toVersion,
      onStep
    )

    expect(result.myProfile).toEqual(whoami.entry)
    expect(result.projects).toEqual([mockProjectData])

    expect(constructProjectDataFetchers).toHaveBeenCalledTimes(1)
    expect(collectExportProjectData).toHaveBeenCalledTimes(1)
    expect(updateProjectMeta).toHaveBeenCalledTimes(1)
    expect(onStep).toHaveBeenCalledTimes(1)
  })
})
