import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MigrationProgressComponent, {
  MigrationProgressProps,
} from '../components/MigrationProgress/MigrationProgress'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MigrationProgress',
  component: MigrationProgressComponent,
} as ComponentMeta<typeof MigrationProgressComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MigrationProgressComponent> = (args) => {
  return <MigrationProgressComponent {...args} />
}

export const MigrationProgress = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
MigrationProgress.storyName = 'MigrationProgress'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: MigrationProgressProps = {
  // assign props here
}
MigrationProgress.args = args
