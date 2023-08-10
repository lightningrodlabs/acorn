import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import FilterDropdownSelect, {
  FilterDropdownSelectProps,
} from '../components/FilterDropdownSelect/FilterDropdownSelect'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Filters/FilterDropdownSelect',
  component: FilterDropdownSelect,
} as ComponentMeta<typeof FilterDropdownSelect>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FilterDropdownSelectProps> = (args) => {
  const [selectedOptionId, setSelectedOptionId] = useState('1')
  return (
    <FilterDropdownSelect
      {...args}
      onSelect={(id) => setSelectedOptionId(id)}
      selectedOptionId={selectedOptionId}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'FilterDropdownSelect'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  icon: <Icon name="circle-check.svg" size="small not-hoverable grey" />,
  text: 'Achievement Status',
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
    {
      icon: <Icon name="circle-check.svg" size="small not-hoverable" />,
      text: 'Option 3',
      id: '3',
    },
  ],
} as FilterDropdownSelectProps
