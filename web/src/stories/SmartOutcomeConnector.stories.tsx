import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import SmartOutcomeConnectorComponent, {
  SmartOutcomeConnectorProps,
} from '../components/SmartOutcomeConnector/SmartOutcomeConnector'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/SmartOutcomeConnector',
  component: SmartOutcomeConnectorComponent,
} as ComponentMeta<typeof SmartOutcomeConnectorComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SmartOutcomeConnectorComponent> = (args) => {
  return <SmartOutcomeConnectorComponent {...args} />
}

export const SmartOutcomeConnector = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
SmartOutcomeConnector.storyName = 'SmartOutcomeConnector'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: SmartOutcomeConnectorProps = {
  // assign props here
}
SmartOutcomeConnector.args = args
