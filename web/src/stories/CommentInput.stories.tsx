import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import CommentInput from '../components/CommentInput/CommentInput'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Comments/CommentInput',
  component: CommentInput,
} as ComponentMeta<typeof CommentInput>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CommentInput> = (args) => {
  return <CommentInput {...args} />
}

export const Primary = Template.bind({})
Primary.storyName = 'CommentInput'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
 
}
