import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MarkdownInput from '../components/MarkdownInput/MarkdownInput'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MarkdownInput',
  component: MarkdownInput,
} as ComponentMeta<typeof MarkdownInput>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MarkdownInput> = (args) => {
  return <MarkdownInput {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
