import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import FilterDropdown from '../components/FilterDropdown/FilterDropdown'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example',
  component: FilterDropdown,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof FilterDropdown>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FilterDropdown> = (args) => {
  const [selectedOptions, setSelectedOptions] = useState(['1'])
  return (
    <FilterDropdown
      {...args}
      selectedOptions={selectedOptions}
      onChange={(state) => setSelectedOptions(state)}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  icon: <Icon name="circle-check.svg" size="small not-hoverable grey" />,
  text: 'Achievement Status',
  options: [
    {
      innerListItem: <div>'Filter Option 1'</div>,
      id: '1',
    },
    {
      innerListItem: <div>'Filter Option 2'</div>,
      id: '2',
    },
    {
      innerListItem: <div>'Filter Option 3'</div>,
      id: '3',
    },
  ],
}
