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

export const UncertainNoChildren = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
UncertainNoChildren.storyName = 'Uncertain, No Children'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
UncertainNoChildren.args = {
  childrenCount: 0,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}

export const UncertainWithChildren = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
UncertainWithChildren.storyName = 'Uncertain With Children'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
UncertainWithChildren.args = {
  childrenCount: 1,
  computedAchievementStatus: {
    uncertains: 4,
    smallsAchieved: 5,
    smallsTotal: 8,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}

export const Big = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
Big.storyName = 'Big (certain, not small)'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Big.args = {
  childrenCount: 12,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 8,
    smallsTotal: 12,
    simple: ComputedSimpleAchievementStatus.PartiallyAchieved,
  },
}

export const SmallNoTasks = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
SmallNoTasks.storyName = 'Small, No Tasks'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SmallNoTasks.args = {
  tasklistCount: 0,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}


export const SmallWithTasks = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
SmallWithTasks.storyName = 'Small, With Tasks'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SmallWithTasks.args = {
  tasklistCount: 12,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}
