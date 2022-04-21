import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Checkbox from '../components/Checkbox/Checkbox'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Checkbox',
  component: Checkbox,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Checkbox>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Checkbox> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  return (
    <Checkbox
      {...args}
      isChecked={selectedState}
      onChange={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'Checkbox'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
}