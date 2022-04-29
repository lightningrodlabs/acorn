import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeTableWithFiltersComponent, {
  OutcomeTableWithFiltersProps,
} from '../components/OutcomeTableWithFilters/OutcomeTableWithFilters'
import { ComputedOutcome, ComputedScope, ComputedSimpleAchievementStatus, Profile } from '../types'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table View/OutcomeTableWithFilters',
  component: OutcomeTableWithFiltersComponent,
} as ComponentMeta<typeof OutcomeTableWithFiltersComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeTableWithFiltersComponent> = (args) => {
  return <OutcomeTableWithFiltersComponent {...args} />
}

const pegah: Profile = {
  firstName: 'Pegah',
  lastName: 'Vaezi',
  handle: '389457985y498592847',
  status: 'Online',
  avatarUrl:
    'https://i.pinimg.com/550x/c0/3d/3f/c03d3f965a8091206f4a0e742bb97c9f.jpg',
  agentPubKey: '389457985y498592847',
  isImported: false,
}

const smallOutcome: ComputedOutcome = {
  headerHash: '12344',
  content:
    'New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  scope: { Small: { achievementStatus: 'Achieved', taskList: [], targetDate: null } },
  tags: [],
  githubLink: '',
  description: 'test description',
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

const bigOutcome: ComputedOutcome = {
  headerHash: '12344',
  content:
    'This is the content property of an Outcome, it can get long sometimes',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
   // ignored in this case
  scope: { Small: { achievementStatus: 'Achieved', taskList: [], targetDate: null } },
  tags: [],
  description: 'test description',
  githubLink: '',
  isImported: false,
  computedScope: ComputedScope.Big,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 1,
    smallsTotal: 1,
    simple: ComputedSimpleAchievementStatus.Achieved,
  },
  children: [smallOutcome],
}

export const OutcomeTableWithFilters = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeTableWithFilters.storyName = 'OutcomeTableWithFilters'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeTableWithFiltersProps = {
  whoAmI: pegah,
  projectMemberProfiles: [],
  computedOutcomesAsTree: [
    // a sample outcome
    bigOutcome
  ],
  openExpandedView: function (headerHash: string): void {
    throw new Error('Function not implemented.')
  },
  tagList: []
}
OutcomeTableWithFilters.args = args
