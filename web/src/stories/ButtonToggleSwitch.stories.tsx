import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonToggleSwitch from '../components/ButtonToggleSwitch/ButtonToggleSwitch'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ButtonToggleSwitch',
  component: ButtonToggleSwitch,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ButtonToggleSwitch>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonToggleSwitch> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  return (
    <ButtonToggleSwitch
      {...args}
      onSwitchState={(state) => setSelectedState(state)}
      switchState={selectedState}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  state1: {
    icon: <Icon name="hierarchy-leaf.svg" size="small not-hoverable" />,
    text: 'State 1',
  },
  state2: {
    icon: <Icon name="hierarchy-leaf.svg" size="small not-hoverable" />,
    text: 'State 2',
  },
}
