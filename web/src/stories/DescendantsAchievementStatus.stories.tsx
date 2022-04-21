import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import DescendantsAchievementStatusComponent from '../components/DescendantsAchievementStatus/DescendantsAchievementStatus'
import { ComputedSimpleAchievementStatus } from '../types'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/DescendantsAchievementStatus',
  component: DescendantsAchievementStatusComponent,
} as ComponentMeta<typeof DescendantsAchievementStatusComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DescendantsAchievementStatusComponent> = (
  args
) => {
  return <DescendantsAchievementStatusComponent {...args} />
}

export const NoChildren = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
NoChildren.storyName = 'No Children'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
NoChildren.args = {
  childrenCount: 0,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}

export const Uncertain = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
Uncertain.storyName = 'Uncertain'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Uncertain.args = {
  childrenCount: 1,
  computedAchievementStatus: {
    uncertains: 1,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}

export const Certain = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
Certain.storyName = 'Certain'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Certain.args = {
  childrenCount: 12,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 8,
    smallsTotal: 12,
    simple: ComputedSimpleAchievementStatus.PartiallyAchieved,
  },
}
