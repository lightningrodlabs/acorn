import { WireRecord } from '../src/api/hdkCrud'
import {
  AllProjectsDataExport,
  ProjectExportDataV1,
  internalExportProjectsData,
} from '../src/migrating/export'
import { LayeringAlgorithm, Profile } from '../src/types'
import {
  testBigAchievedOutcome,
  testSmallAchievedOutcome,
} from '../src/stories/testData/testOutcomes'

import testAgent from '../src/stories/testData/testAgent'
import testProjectMeta from '../src/stories/testData/testProjectMeta'
import testMember from '../src/stories/testData/testMember'
import testTags from '../src/stories/testData/testTags'
import testConnection from '../src/stories/testData/testConnection'
import testEntryPoint from '../src/stories/testData/testEntryPoint'
import testOutcomeMember from '../src/stories/testData/testOutcomeMember'
import testOutcomeVote from '../src/stories/testData/testOutcomeVote'
import testComments from '../src/stories/testData/testComments'

describe('test export functionality', () => {
  let whoami: WireRecord<Profile>
  let mockProjectData: ProjectExportDataV1
  let mockProjectDataFetchers
  let mockBaseRootState

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

    mockProjectDataFetchers = {
      fetchProjectMeta: jest.fn(),
      fetchEntryPoints: jest.fn(),
      fetchOutcomeComments: jest.fn(),
      fetchOutcomeMembers: jest.fn(),
      fetchTags: jest.fn(),
      fetchOutcomes: jest.fn(),
      fetchConnections: jest.fn(),
    }

    mockBaseRootState = {
      whoami,
      cells: { profiles: 'testProfileCellId', projects: ['testProjectCellId'] },
      projects: {
        projectMeta: {
          testProjectCellId: testProjectMeta,
        },
        members: {
          testMemberCellId: {
            testMemberAddress: testMember,
          },
        },
        tags: {
          testTagCellId1: {
            testTagActionHash1: testTags[0],
          },
          testTagCellId2: {
            testTagActionHash2: testTags[1],
          },
        },
        outcomes: {
          testOutcomeCellId1: {
            testOutcome1ActionHash: testBigAchievedOutcome,
          },
          testOutcomeCellId2: {
            testOutcome2ActionHash: testSmallAchievedOutcome,
          },
        },
        connections: {
          testConnectionCellId: {
            testConnectionActionHash: testConnection,
          },
        },
        entryPoints: {
          testEntryPointCellId: {
            testEntryPointActionHash: testEntryPoint,
          },
        },
        outcomeMembers: {
          testOutcomeMemberCellId: {
            testOutcomeMemberActionHash: testOutcomeMember,
          },
        },
        outcomeVotes: {
          testOutcomeVoteCellId: {
            testOutcomeVoteActionHash: testOutcomeVote,
          },
        },
        outcomeComments: {
          testOutcomeCommentCellId: {
            testOutcomeCommentActionHash: testComments[0],
          },
        },
        outcomeHistory: {},
      },
    }
  })

  it('should return projects data', async () => {
    const constructProjectDataFetchers = jest
      .fn()
      .mockReturnValue(mockProjectDataFetchers)

    const updateProjectMeta = jest.fn()

    const collectExportProjectData = jest.fn().mockReturnValue(mockProjectData)
    const mockGetState = jest
      .fn()
      .mockReturnValueOnce(mockBaseRootState)
      .mockReturnValueOnce({
        ...mockBaseRootState,
        agents: testAgent,
        agentAddress: 'testAgentAddress',
      })

    const store = {
      dispatch: jest.fn(),
      getState: mockGetState,
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

    const numProjects = result.projects.length

    expect(constructProjectDataFetchers).toHaveBeenCalledTimes(numProjects)
    expect(collectExportProjectData).toHaveBeenCalledTimes(numProjects)
    expect(updateProjectMeta).toHaveBeenCalledTimes(numProjects)
    expect(onStep).toHaveBeenCalledTimes(numProjects)

    Object.keys(mockProjectDataFetchers).forEach((key) => {
      expect(mockProjectDataFetchers[key]).toHaveBeenCalledTimes(numProjects)
    })
  })
})
