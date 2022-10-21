import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import FilterButton, { FilterButtonProps } from '../components/FilterButton/FilterButton'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Filters/FilterButton',
  component: FilterButton,
} as ComponentMeta<typeof FilterButton>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FilterButton> = (args) => {
  const [selectedState, setSelectedState] = useState(false)
  useEffect(() => {
    setSelectedState(args.isSelected)
  }, [args.isSelected])
  return (
    <FilterButton
      {...args}
      isSelected={selectedState}
      onChange={(state) => setSelectedState(state)}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'FilterButton'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  icon: <Icon name="tag.svg" size="small not-hoverable grey" />,
  text: 'Only show my cards',
  isSelected: true
} as FilterButtonProps
