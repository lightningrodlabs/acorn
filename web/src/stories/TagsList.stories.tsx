import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import TagsListComponent from '../components/TagsList/TagsList'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Tags/TagsList',
  component: TagsListComponent,
} as ComponentMeta<typeof TagsListComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TagsListComponent> = (args) => {
  return <TagsListComponent {...args} />
}

export const TagsList = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
TagsList.storyName = 'TagsList'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
TagsList.args = {
  showAddTagButton: true,
  tags: [
    {
      text: 'Release 0.6.2',
      backgroundColor: '#00A094',
    },
    {
      text: 'Code Refactor',
      backgroundColor: '#1C57C6',
    },
    {
      text: 'Rust Bug',
      backgroundColor: '#B45C11',
    },
    {
      text: 'UI Bug',
      backgroundColor: 'purple',
    },
  ],
}
