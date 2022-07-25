import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeListItem, {
  OutcomeListItemProps,
} from '../components/OutcomeListItem/OutcomeListItem'
import { ComputedScope, ComputedSimpleAchievementStatus } from '../types'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/OutcomeListItem',
  component: OutcomeListItem,
} as ComponentMeta<typeof OutcomeListItem>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeListItem> = (args) => {
  return <OutcomeListItem {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'OutcomeListItem'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeListItemProps = {
  outcome: {
    actionHash: '12344',
    content:
      'New API in typescript definitions are written Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions.',
    creatorAgentPubKey: 'creatoragentpubkey',
    editorAgentPubKey: 'editoryagentpubkey',
    timestampCreated: Date.now(),
    timestampUpdated: Date.now(),
    scope: {
      Small: { achievementStatus: 'Achieved', taskList: [], targetDate: null },
    },
    tags: [],
    description: 'test description',
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
  },
  openExpandedView: () => {},
}
Primary.args = args
