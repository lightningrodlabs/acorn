import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvLeftColumnComponent, {
  EvLeftColumnProps,
} from '../components/ExpandedViewMode/EVLeftColumn/EVLeftColumn'
import { ExpandedViewTab } from '../components/ExpandedViewMode/NavEnum'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/EvLeftColumn',
  component: EvLeftColumnComponent,
} as ComponentMeta<typeof EvLeftColumnComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvLeftColumnComponent> = (args) => {
  return <EvLeftColumnComponent {...args} />
}

export const EvLeftColumn = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
EvLeftColumn.storyName = 'EvLeftColumn'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
EvLeftColumn.args = {
  onChange: () => {},
  activeTab: ExpandedViewTab.Details,
  commentCount: 1,
  outcomeId: 142314
} as EvLeftColumnProps
