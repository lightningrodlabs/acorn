import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import SelectDropdown from '../components/SelectDropdown/SelectDropdown'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/SelectDropdown',
  component: SelectDropdown,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof SelectDropdown>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SelectDropdown> = (args) => {
  const [selectedOptionId, setSelectedOptionId] = useState('1')
  return (
    <SelectDropdown
      {...args}
      onSelect={(id) => setSelectedOptionId(id)}
      selectedOptionId={selectedOptionId}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  options: [
    {
      icon: <Icon name="circle-check.svg" size="small not-hoverable" />,
      text: 'Option 1',
      id: '1',
    },
    {
      icon: <Icon name="circle-check.svg" size="small not-hoverable" />,
      text: 'Option 2',
      id: '2',
    },
  ],
}
