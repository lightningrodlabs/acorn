import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import OutcomeTableFilterSelectorComponent, {
  OutcomeTableFilterSelectorProps,
} from '../components/OutcomeTableFilterSelector/OutcomeTableFilterSelector'
import { OutcomeTableFilter } from '../components/OutcomeTableRow/filterMatch'
import testProfile from './testData/testProfile'
import testTags from './testData/testTags'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table View/OutcomeTableFilterSelector',
  component: OutcomeTableFilterSelectorComponent,
} as ComponentMeta<typeof OutcomeTableFilterSelectorComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OutcomeTableFilterSelectorComponent> = (args) => {
  return <OutcomeTableFilterSelectorComponent {...args} />
}

export const OutcomeTableFilterSelector = Template.bind({})

// 'single story hoist' (place the component at the 'top level' without nesting in the storybook menu)
OutcomeTableFilterSelector.storyName = 'OutcomeTableFilterSelector'
// More on args: https://storybook.js.org/docs/react/writing-stories/args
const args: OutcomeTableFilterSelectorProps = {
  whoAmI: testProfile,
  onApplyOutcomeTableFilter: function (filters: OutcomeTableFilter): void {
    throw new Error('Function not implemented.')
  },
  filter: {},
  projectMemberProfiles: [],
  projectTags: testTags
}
OutcomeTableFilterSelector.args = args
