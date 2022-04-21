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
    headerHash: '12344',
    content:
      'This is the content property of an Outcome, it can get long sometimes',
    creatorAgentPubKey: 'creatoragentpubkey',
    editorAgentPubKey: 'editoryagentpubkey',
    timestampCreated: Date.now(),
    timestampUpdated: Date.now(),
    scope: { Small: 'Achieved' },
    tags: [],
    description: 'test description',
    timeFrame: null, // { fromDate: Date.now(), toDate: Date.now() },
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
}
Primary.args = args
