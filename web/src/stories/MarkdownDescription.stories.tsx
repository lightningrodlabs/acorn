import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MarkdownDescriptionComponent, {
  MarkdownDescriptionProps,
} from '../components/MarkdownDescription/MarkdownDescription'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/MarkdownDescription',
  component: MarkdownDescriptionComponent,
} as ComponentMeta<typeof MarkdownDescriptionComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MarkdownDescriptionComponent> = (
  args
) => {
  return <MarkdownDescriptionComponent {...args} />
}

export const MarkdownDescription = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
MarkdownDescription.storyName = 'MarkdownDescription'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: MarkdownDescriptionProps = {
  // assign props here
}
MarkdownDescription.args = args
