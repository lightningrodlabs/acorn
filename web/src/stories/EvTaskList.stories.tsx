import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvTaskListComponent, { EvTaskListProps } from '../components/ExpandedViewMode/EVMiddleColumn/TabContent/EvTaskList/EvTaskList'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/Tabs/EvTaskList',
  component: EvTaskListComponent,
} as ComponentMeta<typeof EvTaskListComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvTaskListComponent> = (args) => {
  return <EvTaskListComponent {...args} />
}

export const EvTaskList = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
EvTaskList.storyName = 'EvTaskList'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
EvTaskList.args = {
  outcomeContent: 'This is the outcome content',
  tasks: []
} as EvTaskListProps
