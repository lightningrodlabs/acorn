import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import FilterSearch, {
  FilterSearchProps,
} from '../components/FilterSearch/FilterSearch'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Filters/FilterSearch',
  component: FilterSearch,
} as ComponentMeta<typeof FilterSearch>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FilterSearch> = (args) => {
  const [filterText, setFilterText] = useState(args.filterText)
  useEffect(() => {
    setFilterText(args.filterText)
  }, [args.filterText])
  return (
    <FilterSearch
      {...args}
      filterText={filterText}
      setFilterText={setFilterText}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'FilterSearch'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
  placeholderText: 'Filter by keyword or ID number',
} as FilterSearchProps
