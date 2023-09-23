import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeConnectorComponent, {
  OutcomeConnectorProps,
} from '../components/OutcomeConnector/OutcomeConnector'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/OutcomeConnector',
  component: OutcomeConnectorComponent,
} as ComponentMeta<typeof OutcomeConnectorComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeConnectorComponent> = (args) => {
  return <OutcomeConnectorComponent {...args} />
}

export const OutcomeConnector = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeConnector.storyName = 'OutcomeConnector'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeConnectorProps = {
  // assign props here
}
OutcomeConnector.args = args
