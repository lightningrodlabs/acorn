import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ProgressIndicatorCalculatedComponent, {
  ProgressIndicatorCalculatedProps,
} from '../components/ProgressIndicatorCalculated/ProgressIndicatorCalculated'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ProgressIndicatorCalculated',
  component: ProgressIndicatorCalculatedComponent,
} as ComponentMeta<typeof ProgressIndicatorCalculatedComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProgressIndicatorCalculatedComponent> = (args) => {
  return <ProgressIndicatorCalculatedComponent {...args} />
}

export const ProgressIndicatorCalculated = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ProgressIndicatorCalculated.storyName = 'ProgressIndicatorCalculated'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ProgressIndicatorCalculatedProps = {
  // assign props here
}
ProgressIndicatorCalculated.args = args
