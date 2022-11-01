import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import Icon from '../components/Icon/Icon'
import MetadataWithLabel, {
  MetadataWithLabelProps,
} from '../components/MetadataWithLabel/MetadataWithLabel'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/MetadataWithLabel',
  component: MetadataWithLabel,
} as ComponentMeta<typeof MetadataWithLabel>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MetadataWithLabel> = (args) => {
  return <MetadataWithLabel {...args}>metadata</MetadataWithLabel>
}

export const WithIcon = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithIcon.args = {
  label: 'Assignees',
  iconName: 'send-plane.svg'
} as MetadataWithLabelProps

export const WithoutIcon = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithoutIcon.args = {
  label: 'Assignees',
} as MetadataWithLabelProps
