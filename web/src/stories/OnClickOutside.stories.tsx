import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OnClickOutsideComponent, {
  OnClickOutsideProps,
} from '../components/OnClickOutside/OnClickOutside'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/OnClickOutside',
  component: OnClickOutsideComponent,
} as ComponentMeta<typeof OnClickOutsideComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OnClickOutsideComponent> = (args) => {
  return <OnClickOutsideComponent {...args} />
}

export const OnClickOutside = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OnClickOutside.storyName = 'OnClickOutside'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OnClickOutsideProps = {
  // assign props here
}
OnClickOutside.args = args
