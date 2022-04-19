import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeListItem from '../components/OutcomeListItem/OutcomeListItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/OutcomeListItem',
  component: OutcomeListItem,
} as ComponentMeta<typeof OutcomeListItem>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeListItem> = (args) => {
  return <OutcomeListItem {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
