import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ReplaceMeComponent, {
  ReplaceMeProps,
} from '../components/ReplaceMe/ReplaceMe'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ReplaceMe',
  component: ReplaceMeComponent,
} as ComponentMeta<typeof ReplaceMeComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ReplaceMeComponent> = (args) => {
  return <ReplaceMeComponent {...args} />
}

export const ReplaceMe = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ReplaceMe.storyName = 'ReplaceMe'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ReplaceMeProps = {
  // assign props here
}
ReplaceMe.args = args
