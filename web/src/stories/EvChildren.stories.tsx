import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvChildrenComponent, {
  EvChildrenProps,
} from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvChildren/EvChildren'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../types'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Tabs/EvChildren',
  component: EvChildrenComponent,
} as ComponentMeta<typeof EvChildrenComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvChildrenComponent> = (args) => {
  return <EvChildrenComponent {...args} />
}

const outcome1: ComputedOutcome = {
  headerHash: '12344',
  content: 'test content',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  tags: [],
  description: 'test description',
  timeFrame: null, // { fromDate: Date.now(), toDate: Date.now() },
  isImported: false,
  scope: { Uncertain: 0 }, // ignored
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 2,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  // @ts-ignore
  children: [{}, {}],
}
const outcome2: ComputedOutcome = {
  headerHash: '123412847074',
  content: 'This is another outcome',
  creatorAgentPubKey: 'creatoragentpubkey',
  editorAgentPubKey: 'editoryagentpubkey',
  timestampCreated: Date.now(),
  timestampUpdated: Date.now(),
  tags: [],
  description: 'test description',
  timeFrame: null, // { fromDate: Date.now(), toDate: Date.now() },
  isImported: false,
  scope: { Uncertain: 0 }, // ignored
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 2,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
  // @ts-ignore
  children: [{}, {}],
}

export const EvChildren = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
EvChildren.storyName = 'EvChildren'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
EvChildren.args = {
  outcomeContent: 'This would be the content of an Outcome',
  directChildren: [outcome1, outcome2],
} as EvChildrenProps
