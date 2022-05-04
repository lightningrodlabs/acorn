import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import GithubLinkComponent, {
  GithubLinkProps,
} from '../components/GithubLink/GithubLink'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/GithubLink',
  component: GithubLinkComponent,
} as ComponentMeta<typeof GithubLinkComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof GithubLinkComponent> = (args) => {
  const [inputLinkText, setInputLinkText] = useState(
    args.githubLink
  )
  return (
    <GithubLinkComponent
      {...args}
      githubLink={args.githubLink}
      inputLinkText={inputLinkText}
      setInputLinkText={setInputLinkText}
    />
  )
}

export const WithLink = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const withLinkArgs = {
  githubLink: 'https://github.com/h-be/acorn/issues/94',
}
WithLink.args = withLinkArgs

export const WithoutLink = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithoutLink.args = {
  isEditing: true
}
