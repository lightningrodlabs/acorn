import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeTableFilterSelectorComponent, {
  OutcomeTableFilterSelectorProps,
} from '../components/OutcomeTableFilterSelector/OutcomeTableFilterSelector'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table View/OutcomeTableFilterSelector',
  component: OutcomeTableFilterSelectorComponent,
} as ComponentMeta<typeof OutcomeTableFilterSelectorComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeTableFilterSelectorComponent> = (args) => {
  return <OutcomeTableFilterSelectorComponent {...args} />
}

export const OutcomeTableFilterSelector = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeTableFilterSelector.storyName = 'OutcomeTableFilterSelector'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeTableFilterSelectorProps = {
  // assign props here
}
OutcomeTableFilterSelector.args = args
