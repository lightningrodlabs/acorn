import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ChecklistItem, { ChecklistItemProps} from '../components/ChecklistItem/ChecklistItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Checkbox & Checklist/ChecklistItem',
  component: ChecklistItem,

} as ComponentMeta<typeof ChecklistItem>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ChecklistItem> = (args) => {
  const [selectedState, setSelectedState] = useState(args.complete)
  useEffect(() => {
    setSelectedState(args.complete)
  }, [args.complete])
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
  task: 'Create a scope of work, for development.',
  complete: true,
  withStrikethrough: false,
} as ChecklistItemProps

export const withStrikethrough = Template.bind({})
withStrikethrough.args = {
  withStrikethrough: true,
  complete: true,
  size: 'medium',
  task: 'Create a scope of work, for development.',
} as ChecklistItemProps