import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import testProfile from './testProfile'
import { testTag1HeaderHash } from './testTags'

/* Small, Not Achieved */

const testSmallNotAchievedOutcome: ComputedOutcome = {
  headerHash: '12344',
  content:
    'Small Not Achieved, New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: {
    Small: { achievementStatus: 'Achieved', targetDate: null, taskList: [] },
  },
  tags: [testTag1HeaderHash],
  description:
    'Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  githubLink: '',
  isImported: false,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.Achieved,
  },
  children: [],
}

/* Small, Achieved */

const testSmallAchievedOutcome: ComputedOutcome = {
  headerHash: '12345',
  content:
    'Small Achieved, New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: {
    Small: { achievementStatus: 'Achieved', targetDate: null, taskList: [] },
  },
  tags: [testTag1HeaderHash],
  description:
    'Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  githubLink: '',
  isImported: false,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.Achieved,
  },
  children: [],
}

/* Big, Achieved */

const testBigAchievedOutcome: ComputedOutcome = {
  headerHash: '12344',
  content:
    'Acorn no longer uses a legacy unmaintained library',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  // this is ignored when the computedStatus is not Small
  scope: {
    Small: { achievementStatus: 'Achieved', targetDate: null, taskList: [] },
  },
  tags: [],
  githubLink: 'https://github.com/lightningrodlabs/acorn/issues/2',
  description: 'test description',
  isImported: false,
  computedScope: ComputedScope.Big,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 1,
    smallsTotal: 1,
    simple: ComputedSimpleAchievementStatus.Achieved,
  },
  members: [testProfile, testProfile],
  children: [testSmallAchievedOutcome],
}

export { testBigAchievedOutcome, testSmallAchievedOutcome, testSmallNotAchievedOutcome }
