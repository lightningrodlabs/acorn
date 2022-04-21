import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import TagComponent from '../components/Tag/Tag'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Tags/Tag',
  component: TagComponent,
} as ComponentMeta<typeof TagComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TagComponent> = (args) => {
  return <TagComponent {...args} />
}

export const Tag = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
Tag.storyName = 'Tag'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Tag.args = {
  text: 'Tag Name',
  backgroundColor: '#00A094',
}
