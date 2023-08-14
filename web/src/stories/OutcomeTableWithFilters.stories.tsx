import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { HashRouter as Router } from 'react-router-dom'
import '../variables.scss'

import OutcomeTableWithFiltersComponent, {
  OutcomeTableWithFiltersProps,
} from '../components/OutcomeTableWithFilters/OutcomeTableWithFilters'
import testProfile from './testData/testProfile'
import {
  testBigAchievedOutcome,
  testBigPartiallyAchievedOutcome,
} from './testData/testOutcomes'
import testTags from './testData/testTags'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table View/OutcomeTableWithFilters',
  component: OutcomeTableWithFiltersComponent,
} as ComponentMeta<typeof OutcomeTableWithFiltersComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeTableWithFiltersComponent> = (
  args
) => {
  return (
    <Router>
      <OutcomeTableWithFiltersComponent {...args} />
    </Router>
  )
}

export const OutcomeTableWithFilters = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeTableWithFilters.storyName = 'OutcomeTableWithFilters'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeTableWithFiltersProps = {
  whoAmI: testProfile,
  projectMemberProfiles: [testProfile],
  computedOutcomesAsTree: [
    // a sample outcome (has children)
    testBigAchievedOutcome,
    // second oucome sample
    testBigPartiallyAchievedOutcome,
  ],
  openExpandedView: function (actionHash: string): void {
    throw new Error('Function not implemented.')
  },
  projectTags: testTags,
  topPriorityOutcomes: [],
  presentMembers: [],
  goToOutcome: function (actionHash: string): void {
    throw new Error('Function not implemented.')
  },
}
OutcomeTableWithFilters.args = args
