import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ExpandChevron from '../components/ExpandChevron/ExpandChevron'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ExpandChevron',
  component: ExpandChevron,
} as ComponentMeta<typeof ExpandChevron>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ExpandChevron> = (args) => {
  return <ExpandChevron {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
