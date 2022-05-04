import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import EvReadOnlyHeadingComponent, { EvReadOnlyHeadingProps } from '../components/EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../components/Icon/Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Expanded View/EvReadOnlyHeading',
  component: EvReadOnlyHeadingComponent,
} as ComponentMeta<typeof EvReadOnlyHeadingComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EvReadOnlyHeadingComponent> = (args) => {
  return <EvReadOnlyHeadingComponent {...args} />
}

export const EvReadOnlyHeading = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
EvReadOnlyHeading.storyName = 'EvReadOnlyHeading'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
EvReadOnlyHeading.args = {
  headingText: 'this is generally speaking going to be the title/content of an Outcome',
  // @ts-ignore
  overviewIcon: <Icon name='activity-history.svg' />,
  overviewText: '12 comments'
} as EvReadOnlyHeadingProps
