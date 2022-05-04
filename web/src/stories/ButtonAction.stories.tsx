import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonAction from '../components/ButtonAction/ButtonAction'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/ButtonAction',
  component: ButtonAction,
} as ComponentMeta<typeof ButtonAction>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonAction> = (args) => {
  return <ButtonAction {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'ButtonAction'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  icon: <Icon name="share.svg" size="small not-hoverable" />,
  text: 'Action Button',
}