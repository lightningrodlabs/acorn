import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import NetworkInfoComponent, {
  NetworkInfoProps,
} from '../components/NetworkInfo/NetworkInfo'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/NetworkInfo',
  component: NetworkInfoComponent,
} as ComponentMeta<typeof NetworkInfoComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof NetworkInfoComponent> = (args) => {
  return <NetworkInfoComponent {...args} />
}

export const NetworkInfo = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
NetworkInfo.storyName = 'NetworkInfo'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: NetworkInfoProps = {
  // assign props here
}
NetworkInfo.args = args
