import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonTabIcon, {
  ButtonTabIconProps,
} from '../components/ButtonTabIcon/ButtonTabIcon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/ButtonTabIcon',
  component: ButtonTabIcon,
} as ComponentMeta<typeof ButtonTabIcon>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonTabIcon> = (args) => {
  return <ButtonTabIcon {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'ButtonTabIcon'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  iconName: 'activity-history.svg',
  label: 'Test',
  active: true,
  onClick: () => {},
} as ButtonTabIconProps
