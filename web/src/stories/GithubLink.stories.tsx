import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import GithubLinkComponent from '../components/GithubLink/GithubLink'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/GithubLink',
  component: GithubLinkComponent,
} as ComponentMeta<typeof GithubLinkComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof GithubLinkComponent> = (args) => {
  return <GithubLinkComponent {...args} />
}

export const GithubLink = Template.bind({})
GithubLink.storyName = 'GithubLink'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
GithubLink.args = {
  // assign props here
}
