import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Checklist, { ChecklistItemType } from '../components/Checklist/Checklist'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Checkbox & Checklist/Checklist',
  component: Checklist,
} as ComponentMeta<typeof Checklist>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Checklist> = (args) => {
  const [listItems, setListItems] = useState<ChecklistItemType[]>([
    { task: 'Create a scope of work, for development.', complete: true },
    { task: 'Create a scope of work, for development.', complete: false },
    { task: 'Create a scope of work, for development.', complete: false },
  ])
  return (
    <Checklist
      {...args}
      listItems={listItems}
      onChange={async (index, task, complete) => {
        const newListItems = listItems.map((listItem, liIndex) => {
          if (index === liIndex) {
            return { task, complete }
          } else {
            return listItem
          }
        })
        setListItems(newListItems)
      }}
      onAdd={async (task) => {
        setListItems([...listItems, { task, complete: false }])
      }}
      onRemove={async (index) => {
        // clone the array
        const newListItems = [...listItems]
        // remove the indicated one from the list
        newListItems.splice(index, 1)
        // update the list
        setListItems(newListItems)
      }}
    />
  )
}

export const Primary = Template.bind({})
Primary.storyName = 'Checklist'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  size: 'medium',
}
