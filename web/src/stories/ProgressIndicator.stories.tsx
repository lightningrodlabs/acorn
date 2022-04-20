import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ProgressIndicator from '../components/ProgressIndicator/ProgressIndicator'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ProgressIndicator',
  component: ProgressIndicator,
} as ComponentMeta<typeof ProgressIndicator>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProgressIndicator> = (args) => {
  return <ProgressIndicator {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'ProgressIndicator'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
