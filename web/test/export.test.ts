import {
  ProjectExportDataV1,
  internalExportProjectsData,
  updateProjectMeta as _updateProjectMeta,
  collectExportProjectData as _collectExportProjectData,
} from '../src/migrating/export'
import { LayeringAlgorithm } from '../src/types'
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
import mockBaseRootState from './mockBaseRootState'
import _constructProjectDataFetchers from '../src/api/projectDataFetchers'

let mockProjectData: ProjectExportDataV1
let projectDataFetchers: ReturnType<typeof constructProjectDataFetchers>
let baseRootState: typeof mockBaseRootState
let getState: typeof store.getState

let constructProjectDataFetchers: typeof _constructProjectDataFetchers
let updateProjectMeta: typeof _updateProjectMeta
let collectExportProjectData: typeof _collectExportProjectData
let store: any
let toVersion: string
let onStep: Parameters<typeof internalExportProjectsData>[5]
let intergrityVersion: string

describe('test export functionality', () => {
  beforeEach(() => {
    intergrityVersion = '1'

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

    projectDataFetchers = {
      fetchProjectMeta: jest.fn(),
      fetchEntryPoints: jest.fn(),
      fetchOutcomeComments: jest.fn(),
      fetchOutcomeMembers: jest.fn(),
      fetchTags: jest.fn(),
      fetchOutcomes: jest.fn(),
      fetchConnections: jest.fn(),
      // fetchMembers: jest.fn(), // including this line will cause the test to fail, but satisfies the type
    } as any // this is needed because the real implementation does not inclue fetchMembers()

    baseRootState = mockBaseRootState

    getState = jest
      .fn()
      .mockReturnValueOnce(baseRootState)
      .mockReturnValueOnce({
        ...baseRootState,
        agents: testAgent,
        agentAddress: 'testAgentAddress',
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
      })

    constructProjectDataFetchers = jest
      .fn()
      .mockReturnValue(projectDataFetchers)

    updateProjectMeta = jest.fn()

    collectExportProjectData = jest.fn().mockReturnValue(mockProjectData)
    store = {
      dispatch: jest.fn(),
      getState: getState,
    }

    onStep = jest.fn()
    toVersion = 'test'
  })

  it('should return null when state.whoami is undefined', async () => {
    getState = jest.fn().mockReturnValue({
      ...baseRootState,
      whoami: undefined,
    })
    store.getState = getState

    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      store,
      toVersion,
      onStep,
      intergrityVersion
    )

    expect(result).toBeNull()
  })

  it('should return projects data when state.whoami is defined', async () => {
    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      store,
      toVersion,
      onStep,
      intergrityVersion
    )

    expect(result.myProfile).toEqual(baseRootState.whoami.entry)
    expect(result.projects).toEqual([mockProjectData])

    const numProjects = result.projects.length

    expect(constructProjectDataFetchers).toHaveBeenCalledTimes(numProjects)
    expect(collectExportProjectData).toHaveBeenCalledTimes(numProjects)
    expect(updateProjectMeta).toHaveBeenCalledTimes(numProjects)
    expect(onStep).toHaveBeenCalledTimes(numProjects)

    Object.keys(projectDataFetchers).forEach((key) => {
      expect(projectDataFetchers[key]).toHaveBeenCalledTimes(numProjects)
    })
  })
})
