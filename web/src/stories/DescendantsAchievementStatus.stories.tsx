import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import DescendantsAchievementStatusComponent, {
  DescendantsAchievementStatusProps,
} from '../components/DescendantsAchievementStatus/DescendantsAchievementStatus'
import { ComputedScope, ComputedSimpleAchievementStatus } from '../types'

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
const uncertainNoChildrenArgs: DescendantsAchievementStatusProps = {
  childrenCount: 0,
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    tasksAchieved: 0,
    tasksTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}
UncertainNoChildren.args = uncertainNoChildrenArgs

export const UncertainWithChildren = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
UncertainWithChildren.storyName = 'Uncertain With Children'
const uncertainWithChildrenArgs: DescendantsAchievementStatusProps = {
  childrenCount: 1,
  computedScope: ComputedScope.Uncertain,
  computedAchievementStatus: {
    uncertains: 4,
    smallsAchieved: 5,
    smallsTotal: 8,
    tasksAchieved: 0,
    tasksTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}
UncertainWithChildren.args = uncertainWithChildrenArgs

export const Big = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
Big.storyName = 'Big (certain, not small)'
const bigArgs: DescendantsAchievementStatusProps = {
  childrenCount: 12,
  computedScope: ComputedScope.Big,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 8,
    smallsTotal: 12,
    tasksAchieved: 0,
    tasksTotal: 0,
    simple: ComputedSimpleAchievementStatus.PartiallyAchieved,
  },
}
Big.args = bigArgs

export const SmallNoTasks = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
SmallNoTasks.storyName = 'Small, No Tasks'
const smallNoTasksArgs: DescendantsAchievementStatusProps = {
  childrenCount: 0,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    tasksAchieved: 0,
    tasksTotal: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  },
}
SmallNoTasks.args = smallNoTasksArgs

export const SmallWithTasks = Template.bind({})
// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
SmallWithTasks.storyName = 'Small, With Tasks'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const smallWithTasksArgs: DescendantsAchievementStatusProps = {
  childrenCount: 0,
  computedScope: ComputedScope.Small,
  computedAchievementStatus: {
    uncertains: 0,
    smallsAchieved: 0,
    smallsTotal: 0,
    tasksAchieved: 2,
    tasksTotal: 10,
    simple: ComputedSimpleAchievementStatus.PartiallyAchieved,
  },
}
SmallWithTasks.args = smallWithTasksArgs
