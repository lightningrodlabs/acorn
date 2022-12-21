import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import TagsListComponent, {
  TagsListProps,
} from '../components/TagsList/TagsList'
import { ActionHashB64 } from '../types/shared'

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
      actionHash: '123',
    },
    {
      text: 'Code Refactor',
      backgroundColor: '#1C57C6',
      actionHash: '456',
    },
    {
      text: 'Rust Bug',
      backgroundColor: '#B45C11',
      actionHash: '789',
    },
    {
      text: 'UI Bug',
      backgroundColor: 'purple',
      actionHash: '890',
    },
  ],
  onChange: function (newSelectedTags: string[]): void {
    throw new Error('Function not implemented.')
  },
  onCreateTag: function (text: string, backgroundColor: string): Promise<void> {
    throw new Error('Function not implemented.')
  },
  onUpdateExistingTag: function (
    actionHash: ActionHashB64,
    text: string,
    backgroundColor: string
  ): Promise<void> {
    throw new Error('Function not implemented.')
  },
}

TagsList.args = args
