import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import GithubLink from '../components/GithubLink/GithubLink'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/GithubLink',
  component: GithubLink,
} as ComponentMeta<typeof GithubLink>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof GithubLink> = (args) => {
  return <GithubLink {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
