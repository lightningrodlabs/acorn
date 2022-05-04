import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ChecklistItem from '../components/ChecklistItem/ChecklistItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Checkbox & Checklist/ChecklistItem',
  component: ChecklistItem,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ChecklistItem>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ChecklistItem> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  return (
    <ChecklistItem
      {...args}
      complete={selectedState}
      onChangeComplete={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  text: 'Create a scope of work, for development.',
}

export const withStrikethrough = Template.bind({})
withStrikethrough.args = {
  withStrikethrough,
  size: 'medium',
  text: 'Create a scope of work, for development.',
}