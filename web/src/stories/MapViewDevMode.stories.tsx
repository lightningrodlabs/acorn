import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import '../variables.scss'

import MapViewDevModeComponent, {
  MapViewDevModeProps,
} from '../components/MapViewDevMode/MapViewDevMode'
import {
  testBigAchievedOutcome,
  testBigNotAchievedOutcome,
  testBigPartiallyAchievedOutcome,
  testSmallAchievedOutcome,
  testSmallNotAchievedOutcome,
  testUncertainWithChildrenOutcome,
  testUncertainWithoutChildrenOutcome,
} from './testData/testOutcomes'
import testTags from './testData/testTags'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Map View/MapViewDevMode',
  component: MapViewDevModeComponent,
} as ComponentMeta<typeof MapViewDevModeComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MapViewDevModeComponent> = (args) => {
  return <MapViewDevModeComponent {...args} />
}

// More on args: https://storybook.js.org/docs/react/writing-stories/args

const sharedArgs = {
  projectTags: testTags,
  outcomeLeftX: 100,
  outcomeTopY: 100,
  outcomeHeight: 500,
  outcomeWidth: 300,
  // variants
  zoomLevel: 1,
  isSelected: false,
  isTopPriority: false,
  // placeholders
  statementPlaceholder: false,
  tagPlaceholder: false,
  timeAndAssigneesPlaceholder: false,
}

export const SmallNotAchieved = Template.bind({})
const args1: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testSmallNotAchievedOutcome,
}
SmallNotAchieved.args = args1

export const SmallAchieved = Template.bind({})
const args2: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testSmallAchievedOutcome,
}
SmallAchieved.args = args2

export const BigNotAchieved = Template.bind({})
const args3: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testBigNotAchievedOutcome,
}
BigNotAchieved.args = args3

export const BigPartiallyAchieved = Template.bind({})
const args4: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testBigPartiallyAchievedOutcome,
}
BigPartiallyAchieved.args = args4

export const BigAchieved = Template.bind({})
const args5: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testBigAchievedOutcome,
}
BigAchieved.args = args5

export const UncertainWithoutChildren = Template.bind({})
const args6: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testUncertainWithoutChildrenOutcome,
}
UncertainWithoutChildren.args = args6

export const UncertainWithChildren = Template.bind({})
const args7: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testUncertainWithChildrenOutcome,
}
UncertainWithChildren.args = args7

export const SmallAchievedWithPlaceholders = Template.bind({})
const args8: MapViewDevModeProps = {
  ...sharedArgs,
  outcome: testSmallAchievedOutcome,
  outcomeWidth: 450,
  outcomeHeight: 420,
}
SmallAchievedWithPlaceholders.args = args8
