import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ConnectivityOverlayComponent, {
  ConnectivityOverlayProps,
} from '../components/ConnectivityOverlay/ConnectivityOverlay'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'System/ConnectivityOverlay',
  component: ConnectivityOverlayComponent,
} as ComponentMeta<typeof ConnectivityOverlayComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ConnectivityOverlayComponent> = (
  args
) => {
  return <ConnectivityOverlayComponent {...args} />
}

export const ConnectivityOverlay = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ConnectivityOverlay.storyName = 'ConnectivityOverlay'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ConnectivityOverlayProps = {
  // assign props here
  heading: 'Reconnect Acorn',
  content:
    'Acorn lost its connection to the local database due to inactivity. Refresh to reconnect and continue working with Acorn.',
}
ConnectivityOverlay.args = args
