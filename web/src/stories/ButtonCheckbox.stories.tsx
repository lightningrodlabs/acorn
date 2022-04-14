import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ButtonCheckbox from '../components/ButtonCheckbox/ButtonCheckbox'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ButtonCheckbox',
  component: ButtonCheckbox,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ButtonCheckbox>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ButtonCheckbox> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  return (
    <ButtonCheckbox
      {...args}
      isChecked={selectedState}
      onChange={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  icon: <Icon name="hierarchy-leaf.svg" size="small not-hoverable" />,
  text: 'Checkbox',
}
