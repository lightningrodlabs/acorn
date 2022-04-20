import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import TabIconButton from '../components/TabIconButton/TabIconButton'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/TabIconButton',
  component: TabIconButton,
} as ComponentMeta<typeof TabIconButton>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TabIconButton> = (args) => {
  return <TabIconButton {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'TabIconButton'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
