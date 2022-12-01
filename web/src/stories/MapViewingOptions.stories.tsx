import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MapViewingOptionsComponent, {
  MapViewingOptionsProps,
} from '../components/MapViewingOptions/MapViewingOptions'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map View/MapViewingOptions',
  component: MapViewingOptionsComponent,
} as ComponentMeta<typeof MapViewingOptionsComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MapViewingOptionsComponent> = (args) => {
  return <MapViewingOptionsComponent {...args} />
}

export const MapViewingOptions = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
MapViewingOptions.storyName = 'MapViewingOptions'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: MapViewingOptionsProps = {
  // assign props here
  isOpen: true,
}
MapViewingOptions.args = args
