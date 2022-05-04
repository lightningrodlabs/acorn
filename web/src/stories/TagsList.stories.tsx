import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import TagsListComponent, {
  TagsListProps,
} from '../components/TagsList/TagsList'

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
const args: TagsListProps = {
  showAddTagButton: true,
  selectedTags: ['123', '456'],
  tags: [
    {
      text: 'Release 0.6.2',
      backgroundColor: '#00A094',
      headerHash: '123',
    },
    {
      text: 'Code Refactor',
      backgroundColor: '#1C57C6',
      headerHash: '456',
    },
    {
      text: 'Rust Bug',
      backgroundColor: '#B45C11',
      headerHash: '789',
    },
    {
      text: 'UI Bug',
      backgroundColor: 'purple',
      headerHash: '890',
    },
  ],
  onChange: function (newSelectedTags: string[]): void {
    throw new Error('Function not implemented.')
  },
  onSaveTag: function (text: string, backgroundColor: string): Promise<void> {
    throw new Error('Function not implemented.')
  },
}

TagsList.args = args
