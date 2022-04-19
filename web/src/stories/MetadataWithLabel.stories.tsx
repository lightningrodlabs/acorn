import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MetadataWithLabel from '../components/MetadataWithLabel/MetadataWithLabel'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MetadataWithLabel',
  component: MetadataWithLabel,
} as ComponentMeta<typeof MetadataWithLabel>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MetadataWithLabel> = (args) => {
  return <MetadataWithLabel {...args} />
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  // assign props here
}
