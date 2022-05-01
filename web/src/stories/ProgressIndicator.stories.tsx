import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ProgressIndicator, {
  ProgressIndicatorProps,
} from '../components/ProgressIndicator/ProgressIndicator'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ProgressIndicator',
  component: ProgressIndicator,
} as ComponentMeta<typeof ProgressIndicator>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProgressIndicator> = (args) => {
  return <ProgressIndicator {...args} />
}

export const NoProgress = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
NoProgress.args = {
  progress: 0,
} as ProgressIndicatorProps

export const PartialProgress = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
PartialProgress.args = {
  progress: 20,
} as ProgressIndicatorProps

export const FullProgress = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
FullProgress.args = {
  progress: 100,
} as ProgressIndicatorProps
