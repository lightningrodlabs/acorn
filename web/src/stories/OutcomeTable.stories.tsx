import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeTableComponent, {
  OutcomeTableProps,
} from '../components/OutcomeTable/OutcomeTable'
import testTags from './testData/testTags'
import { testBigAchievedOutcome } from './testData/testOutcomes'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table View/OutcomeTable',
  component: OutcomeTableComponent,
} as ComponentMeta<typeof OutcomeTableComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeTableComponent> = (args) => {
  return <OutcomeTableComponent {...args} />
}

export const OutcomeTable = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeTable.storyName = 'OutcomeTable'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeTableProps = {
  projectTags: testTags,
  outcomeTrees: [testBigAchievedOutcome],
  filter: {},
  openExpandedView: function (actionHash: string): void {
    throw new Error('Function not implemented.')
  },
}
OutcomeTable.args = args
