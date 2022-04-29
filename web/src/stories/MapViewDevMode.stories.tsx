import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MapViewDevModeComponent, {
  MapViewDevModeProps,
} from '../components/MapViewDevMode/MapViewDevMode'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MapViewDevMode',
  component: MapViewDevModeComponent,
} as ComponentMeta<typeof MapViewDevModeComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MapViewDevModeComponent> = (args) => {
  return <MapViewDevModeComponent {...args} />
}

export const MapViewDevMode = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
MapViewDevMode.storyName = 'MapViewDevMode'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: MapViewDevModeProps = {
  // assign props here
}
MapViewDevMode.args = args
