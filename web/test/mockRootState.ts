import testAgent from '../src/stories/testData/testAgent'
import testComments from '../src/stories/testData/testComments'
import testConnection from '../src/stories/testData/testConnection'
import testEntryPoint from '../src/stories/testData/testEntryPoint'
import testMember from '../src/stories/testData/testMember'
import testOutcomeMember from '../src/stories/testData/testOutcomeMember'
import {
  testBigAchievedOutcome,
  testSmallAchievedOutcome,
} from '../src/stories/testData/testOutcomes'
import testProjectMeta from '../src/stories/testData/testProjectMeta'
import testTags from '../src/stories/testData/testTags'
import mockWhoami from './mockWhoami'

const mockBaseRootState = {
  whoami: mockWhoami,
  cells: {
    profiles:
      '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1',
    projects: [
      '132,45,36,67,75,209,140,160,204,62,71,45,229,66,99,63,6,255,250,52,234,238,45,50,174,198,118,29,208,28,207,156,147,252,58,99,131,165,51[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1',
    ],
  },
  agentAddress: 'testAgentAddress',
}

export const mockPopulatedState = {
  ...mockBaseRootState,
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
    outcomeComments: {
      testOutcomeCommentCellId: {
        testOutcomeCommentActionHash: testComments[0],
      },
    },
    outcomeHistory: {},
  },
}

export default mockBaseRootState
