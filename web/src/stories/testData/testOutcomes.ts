import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import testProfile from './testProfile'
import {
  testTag1HeaderHash,
  testTag2HeaderHash,
  testTag3HeaderHash,
  testTag4HeaderHash,
  testTag5HeaderHash,
} from './testTags'

/* Small, Not Achieved */

const testSmallNotAchievedOutcome: ComputedOutcome = {
  headerHash: 'test-small-not-achieved-header-hash',
  content:
    'Small Not Achieved, New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: {
    Small: { achievementStatus: 'NotAchieved', targetDate: null, taskList: [] },
  },
  tags: [
    testTag1HeaderHash,
    testTag2HeaderHash,
    testTag3HeaderHash,
    testTag4HeaderHash,
    testTag5HeaderHash,
  ],
  description:
    'Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions. Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  githubLink: '',
  isImported: false,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  children: [],
}

/* Small, Achieved */

const testSmallAchievedOutcome: ComputedOutcome = {
  headerHash: 'test-small-achieved-header-hash',
  content:
    'New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
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


const testSmallAchievedOutcome2: ComputedOutcome = {
  headerHash: 'test-small-achieved-header-hash',
  content:
    'New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
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

/* Big, Not Achieved */

const testBigNotAchievedOutcome: ComputedOutcome = {
  headerHash: 'test-big-not-achieved-header-hash',
  content:
    'Big Not Achieved, Acorn no longer uses a legacy unmaintained library',
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
    smallsAchieved: 0,
    smallsTotal: 1,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  members: [testProfile, testProfile],
  children: [testSmallNotAchievedOutcome],
}

/* Big, Not Achieved */

const testBigPartiallyAchievedOutcome: ComputedOutcome = {
  headerHash: 'test-big-partially-achieved-header-hash',
  content:
    'Big Partially Achieved, Acorn no longer uses a legacy unmaintained library',
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
    smallsTotal: 2,
    simple: ComputedSimpleAchievementStatus.PartiallyAchieved,
  },
  members: [testProfile, testProfile],
  children: [testSmallNotAchievedOutcome, testSmallAchievedOutcome],
}

/* Big, Achieved */

const testBigAchievedOutcome: ComputedOutcome = {
  headerHash: 'test-big-achieved-header-hash',
  content: 'Big Achieved, Acorn no longer uses a legacy unmaintained library',
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

/* Uncertain, Without Children */

const testUncertainWithoutChildrenOutcome: ComputedOutcome = {
  headerHash: 'test-uncertain-without-children-header-hash',
  content:
    'Uncertain Without Children, Acorn no longer uses a legacy unmaintained library',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: {
    Uncertain: { smallsEstimate: 0, timeFrame: null, inBreakdown: false },
  },
  tags: [],
  githubLink: 'https://github.com/lightningrodlabs/acorn/issues/2',
  description: 'test description',
  isImported: false,
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  members: [testProfile, testProfile],
  children: [],
}

/* Uncertain, With Children */

const testUncertainWithChildrenOutcome: ComputedOutcome = {
  headerHash: 'test-uncertain-with-children-header-hash',
  content:
    'Uncertain With Children, Acorn no longer uses a legacy unmaintained library',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: {
    Uncertain: { smallsEstimate: 0, timeFrame: null, inBreakdown: false },
  },
  tags: [],
  githubLink: 'https://github.com/lightningrodlabs/acorn/issues/2',
  description: 'test description',
  isImported: false,
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 1,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  members: [testProfile, testProfile],
  children: [testUncertainWithoutChildrenOutcome],
}

export {
  testBigAchievedOutcome,
  testBigPartiallyAchievedOutcome,
  testBigNotAchievedOutcome,
  testUncertainWithoutChildrenOutcome,
  testUncertainWithChildrenOutcome,
  testSmallAchievedOutcome,
  testSmallAchievedOutcome2,
  testSmallNotAchievedOutcome,
}
