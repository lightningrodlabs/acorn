import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import ModalOutcomeNavigationComponent, {
  ModalOutcomeNavigationProps,
} from '../components/ModalOutcomeNavigation/ModalOutcomeNavigation'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ModalOutcomeNavigation',
  component: ModalOutcomeNavigationComponent,
} as ComponentMeta<typeof ModalOutcomeNavigationComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ModalOutcomeNavigationComponent> = (args) => {
  return <ModalOutcomeNavigationComponent {...args} />
}

export const ModalOutcomeNavigation = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
ModalOutcomeNavigation.storyName = 'ModalOutcomeNavigation'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: ModalOutcomeNavigationProps = {
  // assign props here
}
ModalOutcomeNavigation.args = args
