import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'

export function getPlaceholderOutcome(withText?: string) {
  const placeholderOutcome: ComputedOutcome = {
    actionHash: '',
    content: withText ? withText : '',
    creatorAgentPubKey: '',
    editorAgentPubKey: '',
    timestampCreated: Date.now(),
    timestampUpdated: Date.now(),
    scope: {
      Uncertain: { smallsEstimate: 0, timeFrame: null, inBreakdown: false },
    },
    tags: [],
    description: '',
    isImported: false,
    githubLink: '',
    computedScope: ComputedScope.Uncertain,
    computedAchievementStatus: {
      simple: ComputedSimpleAchievementStatus.NotAchieved,
      smallsAchieved: 0,
      smallsTotal: 0,
      tasksAchieved: 0,
      tasksTotal: 0,
      uncertains: 0,
    },
    children: [],
  }
  return placeholderOutcome
}
