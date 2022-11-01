import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Icon from '../components/Icon/Icon'
import ButtonToggleSwitch, { ButtonToggleSwitchProps} from '../components/ButtonToggleSwitch/ButtonToggleSwitch'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Buttons/ButtonToggleSwitch',
  component: ButtonToggleSwitch,
} as ComponentMeta<typeof ButtonToggleSwitch>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonToggleSwitch> = (args) => {
  const [selectedState, setSelectedState] = useState(args.switchState)
  useEffect(() => {
    setSelectedState(args.switchState)
  }, [args.switchState])
  return (
    <ButtonToggleSwitch
      {...args}
      onSwitchState={(state) => setSelectedState(state)}
      switchState={selectedState}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'ButtonToggleSwitch'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  state1: {
    icon: <Icon name="leaf.svg" size="small not-hoverable" />,
    text: 'State 1',
  },
  state2: {
    icon: <Icon name="leaf.svg" size="small not-hoverable" />,
    text: 'State 2',
  },
  switchState: false
} as ButtonToggleSwitchProps
