import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonClose from '../components/ButtonClose/ButtonClose'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/ButtonClose',
  component: ButtonClose,
} as ComponentMeta<typeof ButtonClose>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonClose> = (args) => {
  return <ButtonClose {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'ButtonClose'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
